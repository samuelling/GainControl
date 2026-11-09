function gc_crowding(varargin)
% GC_CROWDING  GAIN CONTROL perception console, lab version: CROWDING
%
%   STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
%   design as the console, but nobody has validated it on your hardware. Before you collect real data, check
%   the timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and
%   counterbalancing, and the data file it writes. Dot your i's and cross your coding t's.
%
%   Bouma, H. (1970). Interaction effects in parafoveal letter recognition. Nature, 226(5241), 177-178.
%
%   A letter (D H K N R S V Z, 0.9 deg) flashes 150 ms 6 deg left or right of fixation, alone or between two flankers
%   at 0.9-4.5 deg spacing. Type the MIDDLE letter. Bouma's rule: about half the eccentricity (3 deg).
%   gc_crowding   or   gc_crowding('quick')
%   Output: data/crowding_<participant>_<date>.csv  columns: trial, spacing_deg, side, target, response, correct
%   Escape quits (data so far are saved). Needs Psychtoolbox-3.

% ---- your setup ----
S.screenNumber = max(Screen('Screens'));
S.screenWidthCm = 53;   % visible width of the display
S.viewDistCm = 57;      % eyes to screen (57 cm: 1 cm = 1 deg)
S.skipSyncTests = false;
quick = any(strcmpi(varargin, 'quick'));

[win, ~, cx, cy, ppd, ifi, fid, fn] = gcOpen('crowding', 'trial,spacing_deg,side,target,response,correct', .5, S);
try
    LET = 'DHKNRSVZ'; SP = [0 .9 1.5 2.2 3 4.5 NaN]; reps = 20; if quick, reps = 10; end
    order = repmat(SP, 1, reps); order = order(randperm(numel(order)));
    Screen('TextFont', win, 'Arial'); Screen('TextStyle', win, 1);
    fixR = CenterRectOnPoint([0 0 8 8], cx, cy); keysL = num2cell(lower(LET));
    msg(win, 'Keep your eyes on the centre dot. A letter flashes 6 deg to one side, sometimes between two others.\nType the MIDDLE letter (one of D H K N R S V Z). Guess if you have to.\n\nSPACE to start.', 0);
    for t = 1:numel(order)
        s = order(t); side = 2 * (rand < .5) - 1; tgt = LET(randi(8)); others = LET(LET ~= tgt); fl = others(randperm(7, 2));
        Screen('FillRect', win, 0, fixR); vbl = Screen('Flip', win);
        x = cx + side * 6 * ppd; Screen('TextSize', win, round(.9 * ppd * 1.3));
        put(tgt, x); if ~isnan(s) && s > 0, put(fl(1), x - s * ppd); put(fl(2), x + s * ppd); end
        Screen('FillRect', win, 0, fixR); vbl = Screen('Flip', win, vbl + .6);
        Screen('FillRect', win, 0, fixR); Screen('Flip', win, vbl + round(.15 / ifi) * ifi - .5 * ifi); Screen('TextSize', win, 24);
        k = waitKey(keysL); sp = 'alone'; if ~isnan(s), sp = sprintf('%g', s); end
        fprintf(fid, '%d,%s,%d,%s,%s,%d\n', t, sp, side, tgt, upper(k), upper(k) == tgt);
    end
    gcClose(fid, fn);
catch err
    gcClose(fid, fn, err);
end
    function put(ch, x)
        DrawFormattedText(win, ch, 'center', 'center', 0, [], [], [], [], [], CenterRectOnPoint([0 0 2 2] * ppd, x, cy));
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
