function gc_posner(varargin)
% GC_POSNER  GAIN CONTROL perception console, lab version: ORIENTING OF ATTENTION
%
%   STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
%   design as the console, but nobody has validated it on your hardware. Before you collect real data, check
%   the timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and
%   counterbalancing, and the data file it writes. Dot your i's and cross your coding t's.
%
%   Posner, M. I. (1980). Orienting of attention. Quarterly Journal of Experimental Psychology, 32(1), 3-25.
%
%   Two boxes 7 deg left and right. A central arrow (or a neutral plus), then 500-1000 ms later a square in one box:
%   press SPACE as fast as you can. 10% catch trials, 30% neutral, the rest cued with an arrow valid 80% of the time.
%   gc_posner   or   gc_posner('quick')
%   Output: data/posner_<participant>_<date>.csv  columns: trial, kind, cue, target_side, soa_ms, pressed, rt_ms
%   Escape quits (data so far are saved). Needs Psychtoolbox-3.

% ---- your setup ----
S.screenNumber = max(Screen('Screens'));
S.screenWidthCm = 53;   % visible width of the display
S.viewDistCm = 57;      % eyes to screen (57 cm: 1 cm = 1 deg)
S.skipSyncTests = false;
quick = any(strcmpi(varargin, 'quick'));

[win, ~, cx, cy, ppd, ~, fid, fn] = gcOpen('posner', 'trial,kind,cue,target_side,soa_ms,pressed,rt_ms', .12, S);
try
    N = 150; if quick, N = 60; end
    ecc = 7 * ppd; bs = 1.4 * ppd; fixR = CenterRectOnPoint([0 0 6 6], cx, cy);
    boxes = [CenterRectOnPoint([0 0 bs bs], cx - ecc, cy)' CenterRectOnPoint([0 0 bs bs], cx + ecc, cy)'];
    msg(win, 'Eyes on the centre. An arrow (or a plus) appears, then a square flashes in one box.\nPress SPACE as fast as you can when you see it. On a few trials nothing comes: then don''t press.\n\nSPACE to start.');
    for t = 1:N
        r = rand; side = 2 * (rand < .5) - 1;
        if r < .1, kind = 'catch'; cs = {'left', 'right', 'neutral'}; cue = cs{randi(3)}; side = 0;
        elseif r < .4, kind = 'neutral'; cue = 'neutral';
        else
            kind = 'invalid'; if rand < .8, kind = 'valid'; end
            cue = 'right'; if strcmp(kind, 'valid') == (side < 0), cue = 'left'; end
        end
        Screen('FrameRect', win, .6, boxes, 2); Screen('FillRect', win, 1, fixR); Screen('Flip', win); WaitSecs(.7);
        soa = .5 + rand * .5;
        Screen('FrameRect', win, .6, boxes, 2); drawCue(cue); vbl = Screen('Flip', win);
        Screen('FrameRect', win, .6, boxes, 2); drawCue(cue);
        if ~strcmp(kind, 'catch'), Screen('FillRect', win, 1, CenterRectOnPoint([0 0 bs bs] * .6, cx + side * ecc, cy)); end
        t0 = Screen('Flip', win, vbl + soa);
        [k, rt] = waitKey({'space'}, t0, 1.2);
        if isempty(k), rtTxt = ''; else, rtTxt = sprintf('%.1f', rt * 1000); end
        fprintf(fid, '%d,%s,%s,%d,%d,%d,%s\n', t, kind, cue, side, round(soa * 1000), ~isempty(k), rtTxt);
        Screen('FrameRect', win, .6, boxes, 2); Screen('Flip', win); WaitSecs(.4);
    end
    gcClose(fid, fn);
catch err
    gcClose(fid, fn, err);
end
    function drawCue(c)
        if strcmp(c, 'neutral')
            Screen('DrawLines', win, [-14 14 0 0; 0 0 -14 14], 3, 1, [cx cy]);
        else
            d = 1; if strcmp(c, 'left'), d = -1; end
            Screen('DrawLines', win, [-d * 16 d * 16 d * 6 d * 16 d * 6 d * 16; 0 0 -9 0 9 0], 3, 1, [cx cy]);
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
