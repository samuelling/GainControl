function gc_csf(varargin)
% GC_CSF  GAIN CONTROL perception console, lab version: CONTRAST SENSITIVITY
%
%   STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
%   design as the console, but nobody has validated it on your hardware. Before you collect real data, check
%   the timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and
%   counterbalancing, and the data file it writes. Dot your i's and cross your coding t's.
%
%   Campbell, F. W., & Robson, J. G. (1968). Application of Fourier analysis to the visibility of gratings.
%     Journal of Physiology, 197(3), 551-566.
%
%   2IFC detection of a Gabor (4 deg patch, sd 0.9 deg) at 1-8 c/deg (0.5-8 full), one 2-down-1-up staircase per
%   spatial frequency, interleaved; 0.2 log steps, 0.1 after two reversals. Two 300 ms intervals; press 1 or 2.
%   Low contrasts need more than 8 bits: consider PsychImaging('AddTask', 'General', 'EnableNative10BitFramebuffer')
%   (or a Bits#/VPixx/DataPixx mode) and a linearised gamma table for real thresholds.
%   gc_csf   or   gc_csf('quick')
%   Output: data/csf_<participant>_<date>.csv  columns: sf_cpd, trial, contrast, interval, correct
%   Escape quits (data so far are saved). Needs Psychtoolbox-3.

% ---- your setup ----
S.screenNumber = max(Screen('Screens'));
S.screenWidthCm = 53;   % visible width of the display
S.viewDistCm = 57;      % eyes to screen (57 cm: 1 cm = 1 deg)
S.skipSyncTests = false;
quick = any(strcmpi(varargin, 'quick'));

[win, ~, cx, cy, ppd, ifi, fid, fn] = gcOpen('csf', 'sf_cpd,trial,contrast,interval,correct', .5, S);
try
    if quick, SF = [1 2 4 8]; N = 24; else, SF = [.5 1 2 4 8]; N = 40; end
    st = struct('lc', num2cell(log10(.15) * ones(size(SF))), 'step', .2, 'run', 0, 'last', 0, 'rev', {[]});
    order = []; for i = 1:N, order = [order randperm(numel(SF))]; end %#ok<AGROW>
    fixR = CenterRectOnPoint([0 0 6 6], cx, cy); nF = round(.3 / ifi);
    msg(win, 'Two intervals, each marked by a number. A faint striped patch is in ONE of them.\nPress 1 or 2 for the interval that had it. Guess if unsure.\n\nSPACE to start.', 0);
    for t = 1:numel(order)
        k = order(t); c = 10 ^ st(k).lc; which = randi(2);
        tex = gaborTex(win, c, SF(k), 0, ppd, 4, .9, .5);
        Screen('FillRect', win, 0, fixR); Screen('Flip', win); WaitSecs(.5);
        for iv = 1:2
            for f = 1:nF
                if iv == which, Screen('DrawTexture', win, tex); end
                Screen('FillRect', win, 0, fixR); DrawFormattedText(win, num2str(iv), 'center', cy - 120, 0); Screen('Flip', win);
            end
            Screen('FillRect', win, 0, fixR); Screen('Flip', win); WaitSecs(.5);
        end
        Screen('Close', tex);
        r = waitKey({'1!', '2@', '1', '2'}); ok = (r(1) - '0') == which;
        fprintf(fid, '%g,%d,%.6f,%d,%d\n', SF(k), t, c, which, ok);
        d = 0;
        if ok, st(k).run = st(k).run + 1; if st(k).run == 2, st(k).run = 0; d = -1; end
        else, st(k).run = 0; d = 1; end
        if d
            if st(k).last && d ~= st(k).last, st(k).rev(end + 1) = st(k).lc; if numel(st(k).rev) == 2, st(k).step = .1; end, end
            st(k).last = d; st(k).lc = min(0, st(k).lc + d * st(k).step);
        end
    end
    for k = 1:numel(SF)
        r = st(k).rev(3:end); if isempty(r), r = st(k).lc; end
        fprintf('%.1f c/deg: threshold %.4f, sensitivity %.0f\n', SF(k), 10 ^ mean(r), 1 / 10 ^ mean(r));
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
