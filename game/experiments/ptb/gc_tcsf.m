function gc_tcsf(varargin)
% GC_TCSF  GAIN CONTROL perception console, lab version: FLICKER SENSITIVITY (DE LANGE)
%
%   STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
%   design as the console, but nobody has validated it on your hardware. Before you collect real data, check
%   the timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and
%   counterbalancing, and the data file it writes. Dot your i's and cross your coding t's.
%
%   de Lange, H. (1958). Research into the dynamic nature of the human fovea-cortex systems with intermittent and modulated light. I. JOSA, 48(11), 777-784.
%   Kelly, D. H. (1961). Visual responses to time-dependent stimuli. I. Amplitude sensitivity measurements. JOSA, 51(4), 422-429.
%
%   2IFC: a 4 deg disc flickers sinusoidally (raised-sine envelope, 0.6 s) in one interval; rates with whole frames per
%   cycle near 2-15 Hz; interleaved QUESTs on log10 modulation contrast. Use a linearised display.
%   gc_tcsf   or   gc_tcsf('quick')
%   Output: data/tcsf_<participant>_<date>.csv  columns: trial, rate_hz, refresh_hz, contrast, correct
%   Escape quits (data so far are saved). Needs Psychtoolbox-3.

% ---- your setup ----
S.screenNumber = max(Screen('Screens'));
S.screenWidthCm = 53;   % visible width of the display
S.viewDistCm = 57;      % eyes to screen (57 cm: 1 cm = 1 deg)
S.skipSyncTests = false;
quick = any(strcmpi(varargin, 'quick'));

[win, ~, cx, cy, ppd, ifi, fid, fn] = gcOpen('tcsf', 'trial,rate_hz,refresh_hz,contrast,correct', .5, S);
try
    N = 150; if quick, N = 75; end
    hz = round(1 / ifi); rates = unique(round(hz ./ max(4, round(hz ./ [2 4 6 10 15])) * 100) / 100); q = cell(size(rates));
    for i = 1:numel(rates), q{i} = QuestCreate(-1.5, 1.2, .82, 3, .02, .5); q{i}.normalizePdf = 1; end
    msg(win, 'A disc flickers faintly in one of two intervals. Which one: 1 or 2?\n\nSPACE to start.', 0);
    discR = CenterRectOnPoint([0 0 4 4] * ppd, cx, cy);
    for t = 1:N
        ri = mod(t - 1, numel(rates)) + 1; r = rates(ri); c = 10 ^ min(0, max(-2.5, QuestMean(q{ri}))); first = rand < .5;
        fpc = round(hz / r); nf = round(hz * .6);
        for iv = 1:2
            DrawFormattedText(win, num2str(iv), 'center', cy - 240, 0); vbl = Screen('Flip', win); WaitSecs(.5);
            on = (iv == 1) == first;
            for f = 0:nf - 1
                v = .5 * (1 + on * c * sin(pi * f / nf) * sin(2 * pi * f / fpc));
                Screen('FillOval', win, v, discR); DrawFormattedText(win, num2str(iv), 'center', cy - 240, 0); vbl = Screen('Flip', win, vbl + .5 * ifi);
            end
        end
        Screen('Flip', win); k = waitKey({'1!', '2@', '1', '2'}); ok = (k(1) - '0') == 2 - first;
        q{ri} = QuestUpdate(q{ri}, log10(c), ok); fprintf(fid, '%d,%.2f,%d,%.5f,%d\n', t, r, hz, c, ok);
    end
    for i = 1:numel(rates), fprintf('%.2f Hz: sensitivity %.0f\n', rates(i), 1 / 10 ^ QuestMean(q{i})); end
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
