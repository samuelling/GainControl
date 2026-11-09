function gc_dipper(varargin)
% GC_DIPPER  GAIN CONTROL perception console, lab version: CONTRAST DISCRIMINATION (THE DIPPER)
%
%   STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
%   design as the console, but nobody has validated it on your hardware. Before you collect real data, check
%   the timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and
%   counterbalancing, and the data file it writes. Dot your i's and cross your coding t's.
%
%   Legge, G. E., & Foley, J. M. (1980). Contrast masking in human vision. JOSA, 70(12), 1458-1471.
%   Nachmias, J., & Sansbury, R. V. (1974). Grating contrast: Discrimination may be better than detection. Vision Research, 14(10), 1039-1042.
%
%   2IFC: two Gabors (3 c/deg, sd 0.6 deg) at a pedestal (0, .01, .03, .1, .3), one with an increment: which had more
%   contrast? Five interleaved QUESTs on log10 increment. Use a linearised, high bit-depth display for real thresholds.
%   gc_dipper   or   gc_dipper('quick')
%   Output: data/dipper_<participant>_<date>.csv  columns: trial, pedestal, increment, target_interval, response, correct
%   Escape quits (data so far are saved). Needs Psychtoolbox-3.

% ---- your setup ----
S.screenNumber = max(Screen('Screens'));
S.screenWidthCm = 53;   % visible width of the display
S.viewDistCm = 57;      % eyes to screen (57 cm: 1 cm = 1 deg)
S.skipSyncTests = false;
quick = any(strcmpi(varargin, 'quick'));

[win, ~, cx, cy, ppd, ifi, fid, fn] = gcOpen('dipper', 'trial,pedestal,increment,target_interval,response,correct', .5, S);
try
    N = 200; if quick, N = 100; end
    peds = [0 .01 .03 .1 .3]; q = cell(1, 5);
    for k = 1:5, g0 = -2; if peds(k), g0 = log10(max(.006, peds(k) * .25)); end, q{k} = QuestCreate(g0, 1.2, .82, 3, .02, .5); q{k}.normalizePdf = 1; end
    msg(win, 'Two striped patches. Both have the same base contrast (sometimes zero); one has a little extra.\nWhich had MORE contrast: 1 or 2?\n\nSPACE to start.', 0);
    for t = 1:N
        k = mod(t - 1, 5) + 1; p = peds(k); dc = 10 ^ min(-.3, max(-3, QuestMean(q{k}))); first = rand < .5;
        rng0 = rng; tex(1) = gaborTex(win, p + dc * first, 3, 0, ppd, 3.6, .6, .5); rng(rng0); tex(2) = gaborTex(win, p + dc * ~first, 3, 0, ppd, 3.6, .6, .5);   % same phase
        a = twoIFC(win, cx, cy, @(i) Screen('DrawTexture', win, tex(i)), ifi); Screen('Close', tex);
        ok = a == 2 - first; q{k} = QuestUpdate(q{k}, log10(dc), ok);
        fprintf(fid, '%d,%g,%.6f,%d,%d,%d\n', t, p, dc, 2 - first, a, ok);
    end
    for k = 1:5, fprintf('pedestal %.2f: increment threshold %.4f\n', peds(k), 10 ^ QuestMean(q{k})); end
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
