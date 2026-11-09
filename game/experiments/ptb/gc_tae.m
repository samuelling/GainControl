function gc_tae(varargin)
% GC_TAE  GAIN CONTROL perception console, lab version: TILT AFTEREFFECT
%
%   STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
%   design as the console, but nobody has validated it on your hardware. Before you collect real data, check
%   the timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and
%   counterbalancing, and the data file it writes. Dot your i's and cross your coding t's.
%
%   Gibson, J. J., & Radner, M. (1937). Adaptation, after-effect and contrast in the perception of tilted lines. I. JEP, 20(5), 453-467.
%   Clifford, C. W. G., Wenderoth, P., & Spehar, B. (2000). A functional angle on some after-effects in cortical vision. Proc. R. Soc. B, 267, 1705-1710.
%
%   Baseline, then adapted (30 s to a 15 deg clockwise Gabor counterphasing at 1 Hz, 4 s top-ups): a test Gabor flashes
%   150 ms; LEFT/RIGHT for its tilt; 1-up-1-down staircase on tilt. Aftereffect = adapted PSE - baseline PSE.
%   gc_tae   or   gc_tae('quick')
%   Output: data/tae_<participant>_<date>.csv  columns: block, test, tilt_deg_cw, response
%   Escape quits (data so far are saved). Needs Psychtoolbox-3.

% ---- your setup ----
S.screenNumber = max(Screen('Screens'));
S.screenWidthCm = 53;   % visible width of the display
S.viewDistCm = 57;      % eyes to screen (57 cm: 1 cm = 1 deg)
S.skipSyncTests = false;
quick = any(strcmpi(varargin, 'quick'));

[win, ~, cx, cy, ppd, ~, fid, fn] = gcOpen('tae', 'block,test,tilt_deg_cw,response', .5, S);
try
    NT = 40; if quick, NT = 24; end
    fixR = CenterRectOnPoint([0 0 6 6], cx, cy); ad = [gaborTex(win, .9, 1.5, 15, ppd, 8.4, 1.4, .5), gaborTex(win, -.9, 1.5, 15, ppd, 8.4, 1.4, .5)];
    msg(win, 'Is the striped patch tilted LEFT or RIGHT of vertical? Arrow keys.\nFirst a baseline, then 30 s staring at the dot on a tilted grating.\n\nSPACE to start.', 0);
    blocks = {'baseline', 'adapted'}; res = [0 0];
    for b = 1:2
        if b == 2, adapt(30); end
        tilt = 2 * (b == 1); last = 0; rev = [];
        for t = 1:NT
            if b == 2, adapt(4); end
            Screen('FillRect', win, 0, fixR); vbl = Screen('Flip', win);
            tex = gaborTex(win, .9, 1.5, tilt, ppd, 8.4, 1.4, .5); Screen('DrawTexture', win, tex); Screen('FillRect', win, 0, fixR);
            vbl = Screen('Flip', win, vbl + .25); Screen('FillRect', win, 0, fixR); Screen('Flip', win, vbl + .15); Screen('Close', tex);
            k = waitKey({'LeftArrow', 'RightArrow'}); r = 'left'; if strcmp(k, 'RightArrow'), r = 'right'; end
            fprintf(fid, '%s,%d,%g,%s\n', blocks{b}, t, tilt, r);
            d = 1 - 2 * strcmp(r, 'right'); if last && d ~= last, rev(end + 1) = tilt; end %#ok<AGROW>
            last = d; st = 1; if numel(rev) >= 2, st = .5; end
            tilt = max(-10, min(10, tilt + d * st));
        end
        if numel(rev) >= 2, res(b) = mean(rev(max(1, end - 5):end)); else, res(b) = tilt; end
    end
    fprintf('Subjective vertical: baseline %.2f, adapted %.2f; aftereffect %.2f deg\n', res(1), res(2), res(2) - res(1));
    gcClose(fid, fn);
catch err
    gcClose(fid, fn, err);
end
    function adapt(secs)
        t0 = GetSecs;
        while GetSecs - t0 < secs
            Screen('DrawTexture', win, ad(1 + (mod(GetSecs - t0, 1) >= .5))); Screen('FillRect', win, 0, fixR); Screen('Flip', win);
        end
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
