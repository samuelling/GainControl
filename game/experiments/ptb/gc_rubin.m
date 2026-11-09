function gc_rubin(varargin)
% GC_RUBIN  GAIN CONTROL perception console, lab version: RUBIN VASE
%
%   STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
%   design as the console, but nobody has validated it on your hardware. Before you collect real data, check
%   the timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and
%   counterbalancing, and the data file it writes. Dot your i's and cross your coding t's.
%
%   Rubin, E. (1915). Synsoplevede figurer: Studier i psykologisk analyse. Copenhagen: Gyldendalske Boghandel.
%
%   A white vase on black whose edges are two face profiles (forehead, brow, nose, lips, chin, neck).
%   Press A (VASE) or L (FACES) on every change; 30 s with 'quick', otherwise 90 s.
%   gc_rubin   or   gc_rubin('quick')
%   Output: data/rubin_<participant>_<date>.csv  columns: stimulus, percept, onset_s, duration_s
%   Escape quits (data so far are saved). Needs Psychtoolbox-3.

% ---- your setup ----
S.screenNumber = max(Screen('Screens'));
S.screenWidthCm = 53;   % visible width of the display
S.viewDistCm = 57;      % eyes to screen (57 cm: 1 cm = 1 deg)
S.skipSyncTests = false;
quick = any(strcmpi(varargin, 'quick'));

[win, ~, cx, cy, ppd, ifi, fid, fn] = gcOpen('rubin', 'stimulus,percept,onset_s,duration_s', 0, S);
try
    secs = 90; if quick, secs = 30; end
    prof = [0 104; 30 76; 80 66; 110 58; 126 72; 158 30; 178 56; 194 46; 204 60; 216 48; 238 62; 256 50; 288 84; 340 94; 380 118; 400 118];
    top = cy - 200; poly = [cx - prof(:, 2) top + prof(:, 1); flipud([cx + prof(:, 2) top + prof(:, 1)])];
    msg(win, 'Look at the middle. Press A while you see a vase, L while you see two faces, and again at every change.\\n\\nSPACE to start.', 1 - 0);
    names = {'a', 'l'}; labels = {'VASE', 'FACES'}; codes = [KbName('a') KbName('l')]; esc = KbName('ESCAPE');
    cur = 0; tOn = 0; t0 = Screen('Flip', win); vbl = t0;
    while vbl - t0 < secs
        t = vbl - t0;
        Screen('FillPoly', win, [.91 .9 1], poly, 0);
        vbl = Screen('Flip', win);
        [down, secsK, kc] = KbCheck;
        if down
            if kc(esc), error('gc:quit', 'Escape pressed'); end
            hit = find(kc(codes), 1);
            if ~isempty(hit) && hit ~= cur
                if cur, fprintf(fid, '%s,%s,%.3f,%.3f\n', 'rubin', labels{cur}, tOn, secsK - t0 - tOn); end
                cur = hit; tOn = secsK - t0;
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
