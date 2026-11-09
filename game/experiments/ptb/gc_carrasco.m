function gc_carrasco(varargin)
% GC_CARRASCO  GAIN CONTROL perception console, lab version: ATTENTION ALTERS APPEARANCE
%
%   STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
%   design as the console, but nobody has validated it on your hardware. Before you collect real data, check
%   the timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and
%   counterbalancing, and the data file it writes. Dot your i's and cross your coding t's.
%
%   Carrasco, M., Ling, S., & Read, S. (2004). Attention alters appearance. Nature Neuroscience, 7(3), 308-313. (Experiment 2)
%
%   Two Gabors (2 deg, 2 or 4 c/deg, tilted +/-45) at 4 deg left and right of fixation. A 0.3 deg black dot flashes 67 ms
%   1.5 deg above one (uninformative peripheral cue) or at fixation (neutral); 53 ms later the Gabors appear for 40 ms.
%   Standard 22% contrast, test 6-79%. Report the tilt of the patch that looked HIGHER IN CONTRAST:
%   left patch Z (left tilt) / X (right tilt); right patch . (left) / / (right).
%   gc_carrasco   or   gc_carrasco('quick')
%   Output: data/carrasco_<participant>_<date>.csv
%     columns: trial, cue, test_contrast, test_left, sf_cpd, chose_test, tilt_correct, rt_ms
%   Escape quits (data so far are saved). Needs Psychtoolbox-3.

% ---- your setup ----
S.screenNumber = max(Screen('Screens'));
S.screenWidthCm = 53;   % visible width of the display
S.viewDistCm = 57;      % eyes to screen (57 cm: 1 cm = 1 deg)
S.skipSyncTests = false;
quick = any(strcmpi(varargin, 'quick'));

[win, ~, cx, cy, ppd, ifi, fid, fn] = gcOpen('carrasco', 'trial,cue,test_contrast,test_left,sf_cpd,chose_test,tilt_correct,rt_ms', .5, S);
try
    if quick, levels = logspace(log10(.06), log10(.79), 7); reps = 4; else, levels = logspace(log10(.06), log10(.79), 9); reps = 10; end
    cues = {'neutral', 'test', 'standard'};
    [C, Q, ~] = ndgrid(1:numel(levels), 1:3, 1:reps); order = randperm(numel(C)); C = C(order); Q = Q(order);
    F = @(ms) max(1, round(ms / 1000 / ifi)); ecc = 4 * ppd; fixR = CenterRectOnPoint([0 0 6 6], cx, cy);
    msg(win, 'Keep your eyes on the small square in the centre. A dot flashes, then two striped patches.\n\nWhich patch looked HIGHER IN CONTRAST? Report ITS tilt:\nleft patch Z (tilted left) or X (tilted right);  right patch . (left) or / (right).\n\nThe dot tells you nothing. SPACE to start.', 0);
    for t = 1:numel(C)
        c = levels(C(t)); cue = cues{Q(t)}; testLeft = rand < .5; sf = 2 + 2 * (rand < .5);
        oriL = 45 * sign(rand - .5); oriR = 45 * sign(rand - .5);
        if testLeft, cL = c; cR = .22; else, cL = .22; cR = c; end
        Screen('FillRect', win, 0, fixR); vbl = Screen('Flip', win);
        side = 0; if ~strcmp(cue, 'neutral'), side = 1 - 2 * (strcmp(cue, 'test') == testLeft); end
        Screen('FillRect', win, 0, fixR); Screen('gluDisk', win, 0, cx + side * ecc, cy - 1.5 * ppd * (side ~= 0), .15 * ppd);
        vbl = Screen('Flip', win, vbl + (F(500) - .5) * ifi);
        Screen('FillRect', win, 0, fixR); vbl = Screen('Flip', win, vbl + (F(67) - .5) * ifi);
        tL = gaborTex(win, cL, sf, oriL, ppd, 2, 2 / 6, .5); tR = gaborTex(win, cR, sf, oriR, ppd, 2, 2 / 6, .5);
        Screen('DrawTextures', win, [tL tR], [], [CenterRectOnPoint([0 0 2 2] * ppd, cx - ecc, cy)' CenterRectOnPoint([0 0 2 2] * ppd, cx + ecc, cy)']);
        Screen('FillRect', win, 0, fixR); vbl = Screen('Flip', win, vbl + (F(53) - .5) * ifi);
        Screen('FillRect', win, 0, fixR); t0 = Screen('Flip', win, vbl + (F(40) - .5) * ifi); Screen('Close', [tL tR]);
        [k, rt] = waitKey({'z', 'x', '.>', '/?'}, t0);
        choseLeft = any(strcmp(k, {'z', 'x'})); said = 45; if any(strcmp(k, {'z', '.>'})), said = -45; end
        trueOri = oriR; if choseLeft, trueOri = oriL; end
        fprintf(fid, '%d,%s,%.5f,%d,%d,%d,%d,%.1f\n', t, cue, c, testLeft, sf, choseLeft == testLeft, said == trueOri, rt * 1000);
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
