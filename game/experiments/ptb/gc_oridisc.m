function gc_oridisc(varargin)
% GC_ORIDISC  GAIN CONTROL perception console, lab version: ORIENTATION DISCRIMINATION
%
%   STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
%   design as the console, but nobody has validated it on your hardware. Before you collect real data, check
%   the timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and
%   counterbalancing, and the data file it writes. Dot your i's and cross your coding t's.
%
%   Heeley, D. W., & Timney, B. (1988). Meridional anisotropies of orientation discrimination for sine wave gratings. Vision Research, 28(2), 337-344.
%   Appelle, S. (1972). Perception and discrimination as a function of stimulus orientation: The "oblique effect". Psychological Bulletin, 78(4), 266-278.
%
%   A Gabor (3 c/deg, sd 0.5 deg, contrast .5) flashes 200 ms, tilted cw or acw of a reference (vertical or 45 deg, shown
%   by a tick). RIGHT = clockwise, LEFT = anticlockwise. Two interleaved QUESTs (2AFC) on log10 offset (deg).
%   gc_oridisc   or   gc_oridisc('quick')
%   Output: data/oridisc_<participant>_<date>.csv  columns: trial, reference_deg, offset_deg, response, correct
%   Escape quits (data so far are saved). Needs Psychtoolbox-3.

% ---- your setup ----
S.screenNumber = max(Screen('Screens'));
S.screenWidthCm = 53;   % visible width of the display
S.viewDistCm = 57;      % eyes to screen (57 cm: 1 cm = 1 deg)
S.skipSyncTests = false;
quick = any(strcmpi(varargin, 'quick'));

[win, ~, cx, cy, ppd, ~, fid, fn] = gcOpen('oridisc', 'trial,reference_deg,offset_deg,response,correct', .5, S);
try
    N = 120; if quick, N = 60; end
    qV = QuestCreate(0, 1.2, .82, 3.5, .02, .5); qO = QuestCreate(.3, 1.2, .82, 3.5, .02, .5); qV.normalizePdf = 1; qO.normalizePdf = 1;
    msg(win, 'A striped patch flashes, tilted a little clockwise or anticlockwise of the tick (vertical or 45 deg).\nRIGHT = clockwise, LEFT = anticlockwise. Guess when unsure.\n\nSPACE to start.', 0);
    for t = 1:N
        ref = 45 * mod(t, 2); if ref, q = qO; else, q = qV; end
        d = 10 ^ min(1.3, max(-1.3, QuestMean(q))); sgn = 2 * (rand < .5) - 1;
        tick = [sind(ref) * 1.9 * ppd sind(ref) * 2.3 * ppd; -cosd(ref) * 1.9 * ppd -cosd(ref) * 2.3 * ppd];
        tex = gaborTex(win, .5, 3, ref + sgn * d, ppd, 3, .5, .5);
        Screen('DrawLines', win, tick, 2, 0, [cx cy]); Screen('FillRect', win, 0, CenterRectOnPoint([0 0 6 6], cx, cy)); vbl = Screen('Flip', win);
        Screen('DrawLines', win, tick, 2, 0, [cx cy]); Screen('DrawTexture', win, tex); vbl = Screen('Flip', win, vbl + .4);
        Screen('DrawLines', win, tick, 2, 0, [cx cy]); Screen('FillRect', win, 0, CenterRectOnPoint([0 0 6 6], cx, cy)); Screen('Flip', win, vbl + .2);
        Screen('Close', tex);
        k = waitKey({'LeftArrow', 'RightArrow'}); ok = strcmp(k, 'RightArrow') == (sgn > 0);
        q = QuestUpdate(q, log10(d), ok); if ref, qO = q; else, qV = q; end
        r = 'acw'; if strcmp(k, 'RightArrow'), r = 'cw'; end
        fprintf(fid, '%d,%d,%.4f,%s,%d\n', t, ref, sgn * d, r, ok);
    end
    fprintf('Thresholds (deg): vertical %.2f, oblique %.2f\n', 10 ^ QuestMean(qV), 10 ^ QuestMean(qO));
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
