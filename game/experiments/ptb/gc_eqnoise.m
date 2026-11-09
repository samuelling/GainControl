function gc_eqnoise(varargin)
% GC_EQNOISE  GAIN CONTROL perception console, lab version: EQUIVALENT NOISE (LU & DOSHER)
%
%   STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
%   design as the console, but nobody has validated it on your hardware. Before you collect real data, check
%   the timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and
%   counterbalancing, and the data file it writes. Dot your i's and cross your coding t's.
%
%   Lu, Z.-L., & Dosher, B. A. (1998). External noise distinguishes attention mechanisms. Vision Research, 38(9), 1183-1198.
%   Lu, Z.-L., & Dosher, B. A. (2008). Characterizing observers using external noise and observer models. Psychological Review, 115(1), 44-82.
%
%   +/-12 deg orientation identification of a Gabor (2 c/deg, sd 0.35 deg) in Gaussian pixel noise (2 x 2 px, sd 0-.33),
%   sandwich noise, noise, signal+noise, noise, noise (2 frames each). 2-down-1-up and 3-down-1-up staircases per noise
%   level, interleaved. Fit the perceptual template model offline. Needs a linearised display.
%   gc_eqnoise   or   gc_eqnoise('quick')
%   Output: data/eqnoise_<participant>_<date>.csv  columns: trial, external_noise_sd, target_accuracy, contrast, tilt_deg, correct
%   Escape quits (data so far are saved). Needs Psychtoolbox-3.

% ---- your setup ----
S.screenNumber = max(Screen('Screens'));
S.screenWidthCm = 53;   % visible width of the display
S.viewDistCm = 57;      % eyes to screen (57 cm: 1 cm = 1 deg)
S.skipSyncTests = false;
quick = any(strcmpi(varargin, 'quick'));

[win, ~, cx, cy, ppd, ifi, fid, fn] = gcOpen('eqnoise', 'trial,external_noise_sd,target_accuracy,contrast,tilt_deg,correct', .5, S);
try
    NE = [0 .02 .04 .08 .12 .16 .25 .33]; per = 30; if quick, per = 15; end
    [nn, kk] = ndgrid(NE, [2 3]); st = struct('n', num2cell(nn(:)'), 'k', num2cell(kk(:)'), 'lc', 0, 'run', 0, 'last', 0, 'rev', {[]});
    for i = 1:numel(st), st(i).lc = log10(max(.15, st(i).n * 1.5)); end
    order = repmat(1:numel(st), 1, per); order = order(randperm(numel(order)));
    sig = .35 * ppd; n = ceil(sig * 3) * 2 + 2; [xx, yy] = meshgrid((0:n - 1) - (n - 1) / 2); r2 = xx .^ 2 + yy .^ 2; dsk = r2 < ((n - 1) / 2) ^ 2;
    env = exp(-r2 / (2 * sig ^ 2)) .* dsk; fixR = CenterRectOnPoint([0 0 6 6], cx, cy);
    msg(win, 'A small striped patch flashes in a burst of noise, tilted LEFT or RIGHT of vertical.\nPress LEFT or RIGHT. Guess when unsure.\n\nSPACE to start.', 0);
    for t = 1:numel(order)
        i = order(t); c = min(1, 10 ^ st(i).lc); ori = 12 * (2 * (rand < .5) - 1); tex = zeros(1, 5);
        for f = 1:5
            g = (f == 3) * c * env .* sin(2 * pi * 2 / ppd * (xx * cosd(ori) + yy * sind(ori)));
            nz = 0; if st(i).n, nz = kron(min(.5, max(-.5, st(i).n * randn(n / 2))), ones(2)) .* dsk; end
            tex(f) = Screen('MakeTexture', win, min(1, max(0, .5 * (1 + g + nz))), [], [], 2);
        end
        Screen('FillRect', win, 0, fixR); vbl = Screen('Flip', win); when = vbl + .35;
        for f = 1:5, Screen('DrawTexture', win, tex(f)); vbl = Screen('Flip', win, when - .5 * ifi); when = vbl + 2 * ifi; end
        Screen('FillRect', win, 0, fixR); Screen('Flip', win, when - .5 * ifi); Screen('Close', tex);
        k = waitKey({'LeftArrow', 'RightArrow'}); ok = strcmp(k, 'RightArrow') == (ori > 0);
        fprintf(fid, '%d,%g,%.3f,%.5f,%d,%d\n', t, st(i).n, .707 + .087 * (st(i).k == 3), c, ori, ok);
        stp = .1; if numel(st(i).rev) >= 2, stp = .05; end
        d = 0; if ok, st(i).run = st(i).run + 1; if st(i).run >= st(i).k, st(i).run = 0; d = -1; end, else, st(i).run = 0; d = 1; end
        if d, if st(i).last && d ~= st(i).last, st(i).rev(end + 1) = st(i).lc; end, st(i).last = d; st(i).lc = min(0, max(-2.7, st(i).lc + d * stp)); end
    end
    gcClose(fid, fn);
catch err
    gcClose(fid, fn, err);
end
end

% ---------------- shared helpers ----------------
function [win, rect, cx, cy, ppd, ifi, fid, fn] = gcOpen(id, header, bg, S)
% participant ID, data file (data/<id>_<participant>_<date>.csv), window, pixels per degree, frame interval
participant = input('Participant ID: ', 's'); if isempty(participant), participant = 'anon'; end
here = fileparts(mfilename('fullpath')); if ~exist(fullfile(here, 'data'), 'dir'), mkdir(fullfile(here, 'data')); end
fn = fullfile(here, 'data', sprintf('%s_%s_%s.csv', id, participant, datestr(now, 'yyyy-mm-dd_HHMM')));
fid = fopen(fn, 'w'); fprintf(fid, '%s\n', header);
PsychDefaultSetup(2); KbName('UnifyKeyNames');
if S.skipSyncTests, Screen('Preference', 'SkipSyncTests', 1); end
[win, rect] = PsychImaging('OpenWindow', S.screenNumber, bg);
Screen('BlendFunction', win, 'GL_SRC_ALPHA', 'GL_ONE_MINUS_SRC_ALPHA');
[cx, cy] = RectCenter(rect); ppd = rect(3) / S.screenWidthCm * 2 * S.viewDistCm * tand(.5); ifi = Screen('GetFlipInterval', win);
Screen('TextSize', win, 24); HideCursor;
end

function gcClose(fid, fn, err)
% close the file and the screen; rethrow anything but Escape
fclose(fid); sca; ShowCursor;
if nargin > 2 && ~isempty(err) && ~strcmp(err.identifier, 'gc:quit'), rethrow(err); end
fprintf('Saved %s\n', fn);
end

function tex = gaborTex(win, c, sfCpd, oriDeg, ppd, sizeDeg, sdDeg, bg)
% a Gabor on grey bg (0-1) as a float texture; ori 0 = vertical stripes, positive = clockwise; random phase
n = round(sizeDeg * ppd); [x, y] = meshgrid((1:n) - n / 2); th = oriDeg * pi / 180;
env = exp(-(x .^ 2 + y .^ 2) / (2 * (sdDeg * ppd) ^ 2));
L = bg * (1 + c * env .* sin(2 * pi * sfCpd / ppd * (x * cos(th) + y * sin(th)) + rand * 2 * pi));
tex = Screen('MakeTexture', win, min(1, max(0, L)), [], [], 2);
end

function msg(win, text, col, wait)
if nargin < 3 || isempty(col), col = [1 1 1]; end
if nargin < 4, wait = true; end
DrawFormattedText(win, text, 'center', 'center', col, 90); Screen('Flip', win);
if wait, waitKey({'space', 'Return'}); end
end

function [k, rt] = waitKey(names, t0, maxWait)
% wait for one of the named keys (KbName names); Escape quits. rt from t0 (GetSecs). k = '' after maxWait seconds
if nargin < 2 || isempty(t0), t0 = GetSecs; end
if nargin < 3, maxWait = inf; end
codes = zeros(1, numel(names)); for i = 1:numel(names), c = KbName(names{i}); codes(i) = c(1); end
esc = KbName('ESCAPE'); KbReleaseWait;
while GetSecs - t0 < maxWait
    [down, secs, kc] = KbCheck;
    if down
        if kc(esc), error('gc:quit', 'Escape pressed'); end
        hit = find(kc(codes), 1);
        if ~isempty(hit), k = names{hit}; rt = secs - t0; return; end
    end
    WaitSecs(0.001);
end
k = ''; rt = NaN;
end

function a = twoIFC(win, cx, cy, drawFn, ifi, dur, isi, col)
% two numbered intervals; drawFn(i) draws interval i's stimulus. Returns the interval chosen (1 or 2)
if nargin < 6, dur = .2; end
if nargin < 7, isi = .5; end
if nargin < 8, col = 0; end
for i = 1:2
    DrawFormattedText(win, num2str(i), 'center', cy - 240, col); Screen('DrawLines', win, [-7 7 0 0; 0 0 -7 7], 2, col, [cx cy]);
    vbl = Screen('Flip', win);
    drawFn(i); DrawFormattedText(win, num2str(i), 'center', cy - 240, col);
    vbl = Screen('Flip', win, vbl + isi - .5 * ifi);
    Screen('DrawLines', win, [-7 7 0 0; 0 0 -7 7], 2, col, [cx cy]); Screen('Flip', win, vbl + dur - .5 * ifi);
end
k = waitKey({'1!', '2@', '1', '2'}); a = k(1) - '0';
end
