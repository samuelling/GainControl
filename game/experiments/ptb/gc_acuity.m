function gc_acuity(varargin)
% GC_ACUITY  GAIN CONTROL perception console, lab version: VISUAL ACUITY (TUMBLING E)
%
%   STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
%   design as the console, but nobody has validated it on your hardware. Before you collect real data, check
%   the timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and
%   counterbalancing, and the data file it writes. Dot your i's and cross your coding t's.
%
%   Snellen, H. (1862). Probebuchstaben zur Bestimmung der Sehschärfe. Utrecht: Van de Weijer.
%   Bailey, I. L., & Lovie, J. E. (1976). New design principles for visual acuity letter charts. Am. J. Optom. Physiol. Opt., 53(11), 740-745.
%   Watson, A. B., & Pelli, D. G. (1983). QUEST: A Bayesian adaptive psychometric method. Perception & Psychophysics, 33(2), 113-120.
%
%   A black tumbling E on white faces right, down, left or up; press the arrow key for the way its bars point.
%   QUEST (PTB's QuestCreate; 4AFC, gamma .25) on log10 stroke width in pixels; MAR = threshold stroke in arcmin.
%   Set screenWidthCm and viewDistCm carefully. gc_acuity   or   gc_acuity('quick')
%   Output: data/acuity_<participant>_<date>.csv  columns: trial, stroke_px, stroke_arcmin, direction, correct
%   Escape quits (data so far are saved). Needs Psychtoolbox-3.

% ---- your setup ----
S.screenNumber = max(Screen('Screens'));
S.screenWidthCm = 53;   % visible width of the display
S.viewDistCm = 57;      % eyes to screen (57 cm: 1 cm = 1 deg)
S.skipSyncTests = false;
quick = any(strcmpi(varargin, 'quick'));

[win, ~, cx, cy, ppd, ~, fid, fn] = gcOpen('acuity', 'trial,stroke_px,stroke_arcmin,direction,correct', 1, S);
try
    N = 60; if quick, N = 30; end
    pxArcmin = ppd / 60; q = QuestCreate(log10(max(2, 2 * pxArcmin)), 1.2, .82, 3.5, .02, .25); q.normalizePdf = 1;
    names = {'RightArrow', 'DownArrow', 'LeftArrow', 'UpArrow'}; dirs = {'right', 'down', 'left', 'up'};
    msg(win, 'Which way does the E face (the way its three bars point)? Press the arrow key.\nGuess when unsure.\n\nSPACE to start.', 0);
    for t = 1:N
        s = max(1, round(10 ^ min(log10(60), max(0, QuestMean(q))))); d = randi(4);
        % the E facing right: spine on the left, bars at the top, middle and bottom; rotated by (d-1)*90 deg
        R = [-2.5 -2.5 -1.5 2.5; -2.5 -2.5 2.5 -1.5; -2.5 -.5 2.5 .5; -2.5 1.5 2.5 2.5] * s;
        th = (d - 1) * pi / 2; rot = @(x, y) [x * cos(th) - y * sin(th), x * sin(th) + y * cos(th)];
        for r = 1:4
            c = [rot(R(r, 1), R(r, 2)); rot(R(r, 3), R(r, 2)); rot(R(r, 3), R(r, 4)); rot(R(r, 1), R(r, 4))];
            Screen('FillPoly', win, 0, c + [cx cy], 1);
        end
        Screen('Flip', win);
        k = waitKey(names); ok = strcmp(k, names{d});
        q = QuestUpdate(q, log10(s), ok);
        fprintf(fid, '%d,%d,%.3f,%s,%d\n', t, s, s / pxArcmin, dirs{d}, ok);
        Screen('Flip', win); WaitSecs(.2);
    end
    mar = 10 ^ QuestMean(q) / pxArcmin; fprintf('Threshold stroke %.2f arcmin, logMAR %.2f\n', mar, log10(mar));
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
