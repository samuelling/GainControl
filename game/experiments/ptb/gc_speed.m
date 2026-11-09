function gc_speed(varargin)
% GC_SPEED  GAIN CONTROL perception console, lab version: SPEED DISCRIMINATION
%
%   STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
%   design as the console, but nobody has validated it on your hardware. Before you collect real data, check
%   the timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and
%   counterbalancing, and the data file it writes. Dot your i's and cross your coding t's.
%
%   McKee, S. P. (1981). A local mechanism for differential velocity detection. Vision Research, 21(4), 491-500.
%
%   2IFC: two drifting Gabors (base 2 or 6 deg/s split by a Weber fraction; SF, duration and direction randomised).
%   Which moved faster: 1 or 2? Two interleaved QUESTs on log10 Weber fraction.
%   gc_speed   or   gc_speed('quick')
%   Output: data/speed_<participant>_<date>.csv  columns: trial, base_deg_s, weber_fraction, faster_interval, response, correct
%   Escape quits (data so far are saved). Needs Psychtoolbox-3.

% ---- your setup ----
S.screenNumber = max(Screen('Screens'));
S.screenWidthCm = 53;   % visible width of the display
S.viewDistCm = 57;      % eyes to screen (57 cm: 1 cm = 1 deg)
S.skipSyncTests = false;
quick = any(strcmpi(varargin, 'quick'));

[win, ~, cx, cy, ppd, ifi, fid, fn] = gcOpen('speed', 'trial,base_deg_s,weber_fraction,faster_interval,response,correct', .5, S);
try
    N = 100; if quick, N = 50; end
    bases = [2 6]; q = {QuestCreate(-1, 1.2, .82, 3.5, .02, .5), QuestCreate(-1, 1.2, .82, 3.5, .02, .5)}; q{1}.normalizePdf = 1; q{2}.normalizePdf = 1;
    n = round(4.8 * ppd); [xx, yy] = meshgrid((1:n) - n / 2); env = exp(-(xx .^ 2 + yy .^ 2) / (2 * (.8 * ppd) ^ 2));
    msg(win, 'Two drifting striped patches. Which moved FASTER: 1 or 2?\nDuration and stripe spacing vary on purpose.\n\nSPACE to start.', 0);
    for t = 1:N
        bi = 2 - mod(t, 2); b = bases(bi); wf = 10 ^ min(-.2, max(-2, QuestMean(q{bi}))); fastFirst = rand < .5;
        sp = [b * sqrt(1 + wf), b / sqrt(1 + wf)]; if ~fastFirst, sp = fliplr(sp); end
        for iv = 1:2
            DrawFormattedText(win, num2str(iv), 'center', cy - 240, 0); vbl = Screen('Flip', win); WaitSecs(.5);
            cpd = 1.5 + rand; nF = round((.3 + rand * .2) / ifi); d = 2 * (rand < .5) - 1; ph = rand * 2 * pi;
            for f = 1:nF
                L = .5 * (1 + .5 * env .* sin(2 * pi * cpd / ppd * xx + ph + d * 2 * pi * cpd * sp(iv) * f * ifi));
                tex = Screen('MakeTexture', win, L, [], [], 2); Screen('DrawTexture', win, tex); DrawFormattedText(win, num2str(iv), 'center', cy - 240, 0);
                vbl = Screen('Flip', win, vbl + .5 * ifi); Screen('Close', tex);
            end
        end
        Screen('Flip', win); k = waitKey({'1!', '2@', '1', '2'}); a = k(1) - '0'; ok = a == 2 - fastFirst;
        q{bi} = QuestUpdate(q{bi}, log10(wf), ok); fprintf(fid, '%d,%g,%.5f,%d,%d,%d\n', t, b, wf, 2 - fastFirst, a, ok);
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
