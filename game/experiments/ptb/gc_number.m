function gc_number(varargin)
% GC_NUMBER  GAIN CONTROL perception console, lab version: NUMBER SENSE
%
%   STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
%   design as the console, but nobody has validated it on your hardware. Before you collect real data, check
%   the timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and
%   counterbalancing, and the data file it writes. Dot your i's and cross your coding t's.
%
%   Halberda, J., Mazzocco, M. M. M., & Feigenson, L. (2008). Individual differences in non-verbal number acuity correlate
%     with maths achievement. Nature, 455(7213), 665-668.
%
%   Two clouds of dots flash for 300 ms: yellow left, blue right, ratios 1.1-2. D = yellow had more, K = blue.
%   Half the trials equate dot size, half total area. Fit w: P(correct) = Phi(|n1-n2| / (w * sqrt(n1^2+n2^2))).
%   gc_number   or   gc_number('quick')
%   Output: data/number_<participant>_<date>.csv  columns: trial, n_yellow, n_blue, ratio, equal_size_dots, correct
%   Escape quits (data so far are saved). Needs Psychtoolbox-3.

% ---- your setup ----
S.screenNumber = max(Screen('Screens'));
S.screenWidthCm = 53;   % visible width of the display
S.viewDistCm = 57;      % eyes to screen (57 cm: 1 cm = 1 deg)
S.skipSyncTests = false;
quick = any(strcmpi(varargin, 'quick'));

[win, ~, cx, cy, ppd, ~, fid, fn] = gcOpen('number', 'trial,n_yellow,n_blue,ratio,equal_size_dots,correct', .5, S);
try
    RAT = [1.1 1.2 1.33 1.5 2]; reps = 24; if quick, reps = 12; end
    order = repmat(RAT, 1, reps); order = order(randperm(numel(order)));
    msg(win, 'Two clouds of dots flash: yellow on the left, blue on the right. Which had more?\nToo fast to count: go with your impression. D = yellow, K = blue.\n\nSPACE to start.', 0);
    for t = 1:numel(order)
        small = randi([6 14]); big = round(small * order(t)); yMore = rand < .5; eq = rand < .5;
        if yMore, nY = big; nB = small; else, nY = small; nB = big; end
        Screen('FillRect', win, 0, CenterRectOnPoint([0 0 6 6], cx, cy)); vbl = Screen('Flip', win);
        cloud(nY, cx - 6.5 * ppd, [.98 .84 .16]); cloud(nB, cx + 6.5 * ppd, [.24 .47 1]);
        vbl = Screen('Flip', win, vbl + .5); Screen('Flip', win, vbl + .3);
        k = waitKey({'d', 'k'});
        fprintf(fid, '%d,%d,%d,%.3f,%d,%d\n', t, nY, nB, big / small, eq, strcmp(k, 'd') == yMore);
    end
    gcClose(fid, fn);
catch err
    gcClose(fid, fn, err);
end
    function cloud(n, x0, col)
        R = 5 * ppd; rr = 11 * sqrt(10 / n); if eq, rr = 7; end
        pts = zeros(0, 2); tries = 0;
        while size(pts, 1) < n && tries < 4000
            tries = tries + 1; a = rand * 2 * pi; r = R * sqrt(rand); p = [x0 + r * cos(a), cy + r * sin(a)];
            if isempty(pts) || all(hypot(pts(:, 1) - p(1), pts(:, 2) - p(2)) > rr * 2.4), pts(end + 1, :) = p; end %#ok<AGROW>
        end
        Screen('DrawDots', win, pts', 2 * max(3, rr), col, [], 2);
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
