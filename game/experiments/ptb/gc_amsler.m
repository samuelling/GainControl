function gc_amsler(varargin)
% GC_AMSLER  GAIN CONTROL perception console, lab version: AMSLER GRID
%
%   STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
%   design as the console, but nobody has validated it on your hardware. Before you collect real data, check
%   the timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and
%   counterbalancing, and the data file it writes. Dot your i's and cross your coding t's.
%
%   Amsler, M. (1953). Earliest symptoms of diseases of the macula. British Journal of Ophthalmology, 37(9), 521-537.
%
%   The central 20 x 20 deg grid (1 deg squares), one eye at a time; click where lines look wavy, blurred or missing;
%   SPACE for the next eye. A demonstration of the clinical self-check, not a test.
%   gc_amsler
%   Output: data/amsler_<participant>_<date>.csv  columns: eye, x_deg, y_deg  (x right, y up)
%   Escape quits (data so far are saved). Needs Psychtoolbox-3.

% ---- your setup ----
S.screenNumber = max(Screen('Screens'));
S.screenWidthCm = 53;   % visible width of the display
S.viewDistCm = 57;      % eyes to screen (57 cm: 1 cm = 1 deg)
S.skipSyncTests = false;
quick = any(strcmpi(varargin, 'quick'));

[win, rect, cx, cy, ppd, ~, fid, fn] = gcOpen('amsler', 'eye,x_deg,y_deg', 1, S);
try
    side = min(rect(4) - 40, 20 * ppd); cellW = side / 20; v = -side / 2:cellW:side / 2;
    xy = [reshape([v; v], 1, []) reshape(repmat([-side / 2; side / 2], 1, 21), 1, []); reshape(repmat([-side / 2; side / 2], 1, 21), 1, []) reshape([v; v], 1, [])];
    eyes = {'left', 'right'};
    for e = 1:2
        cover = 'RIGHT'; if e == 2, cover = 'LEFT'; end
        msg(win, sprintf('Cover your %s eye. Look only at the centre dot.\nClick anywhere the lines look wavy, bent, blurred or missing; SPACE when done.\n\nSPACE to start.', cover), 0); ShowCursor;
        marks = zeros(0, 2);
        while true
            Screen('DrawLines', win, xy, 1.5, 0, [cx cy]); Screen('gluDisk', win, 0, cx, cy, 5);
            for i = 1:size(marks, 1), Screen('FrameOval', win, [.76 .16 .25], CenterRectOnPoint([0 0 18 18], marks(i, 1), marks(i, 2)), 2.5); end
            Screen('Flip', win);
            [~, ~, kc] = KbCheck; if kc(KbName('ESCAPE')), error('gc:quit', 'Escape'); end
            if kc(KbName('space')), KbReleaseWait; break; end
            [mx, my, b] = GetMouse(win);
            if any(b)
                while any(b), [~, ~, b] = GetMouse(win); end
                if abs(mx - cx) <= side / 2 && abs(my - cy) <= side / 2
                    marks(end + 1, :) = [mx my]; fprintf(fid, '%s,%.3f,%.3f\n', eyes{e}, (mx - cx) / ppd, -(my - cy) / ppd); %#ok<AGROW>
                end
            end
        end
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
