function gc_mae(adaptCorr, varargin)
% GC_MAE  GAIN CONTROL perception console, lab version: MOTION AFTEREFFECT (PS 327 Lab 05)
%
%   STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
%   design as the console, but nobody has validated it on your hardware. Before you collect real data, check
%   the timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and
%   counterbalancing, and the data file it writes. Dot your i's and cross your coding t's.
%
%   Addams, R. (1834). An account of a peculiar optical phaenomenon seen after having looked at a moving body.
%     London and Edinburgh Philosophical Magazine and Journal of Science, 5(29), 373-374.
%   Blake, R., & Hiris, E. (1993). Another means for measuring the motion aftereffect. Vision Research, 33(11), 1589-1592.
%
%   MotionAfterDots: 1000 dots stream radially through an annulus (1-7 deg) for 20 s (adaptation, green),
%   then each trial is a 0.5 s red test in which a fraction of the dots (the "correlation", 0-1) move outward
%   and the rest inward. D = inward, K = outward. 2 s top-up after every trial.
%   gc_mae(1)  adapt to expansion     gc_mae(0)  contraction     gc_mae(0.5)  no net motion
%   Add 'quick' for 3 blocks instead of 10. Escape quits (data so far are saved).
%   Output: data/mae_<participant>_<date>.csv  columns: adapt_corr, block, test_corr, said_outward

% ---- your setup ----
screenNumber = max(Screen('Screens'));
screenWidthCm = 53;     % visible width of the display
viewDistCm = 57;        % eyes to screen
skipSyncTests = false;

if nargin < 1, adaptCorr = 1; end
nBlocks = 10; if any(strcmpi(varargin, 'quick')), nBlocks = 3; end
P = struct('nDots', 1000, 'sizePx', 5, 'speed', 6, 'ecc', [1 7], 'tests', 0:.1:1, 'testS', .5, 'adapt0', 20, 'topUp', 2, 'gap', .5);
participant = input('Participant ID: ', 's'); if isempty(participant), participant = 'anon'; end
here = fileparts(mfilename('fullpath')); if ~exist(fullfile(here, 'data'), 'dir'), mkdir(fullfile(here, 'data')); end
fn = fullfile(here, 'data', sprintf('mae_%s_%s.csv', participant, datestr(now, 'yyyy-mm-dd_HHMM')));
fid = fopen(fn, 'w'); fprintf(fid, 'adapt_corr,block,test_corr,said_outward\n');

PsychDefaultSetup(2); KbName('UnifyKeyNames');
if skipSyncTests, Screen('Preference', 'SkipSyncTests', 1); end
try
    [win, rect] = PsychImaging('OpenWindow', screenNumber, [0 0 0]);
    Screen('BlendFunction', win, 'GL_SRC_ALPHA', 'GL_ONE_MINUS_SRC_ALPHA');
    [cx, cy] = RectCenter(rect); Screen('TextSize', win, 24); HideCursor;
    ppd = rect(3) / screenWidthCm * 2 * viewDistCm * tand(.5); ifi = Screen('GetFlipInterval', win);
    rmin = P.ecc(1) * ppd; rmax = P.ecc(2) * ppd; n = P.nDots;
    DrawFormattedText(win, 'Keep your eyes on the centre dot the whole time.\n\nGreen dots stream for a while: adaptation. Then red dots flash for half a second,\nsome moving in, some out. Report which way the RED dots went overall: D inward, K outward.\n\nSPACE to start.', 'center', 'center', 1);
    Screen('Flip', win); waitKey({'space'});
    play(adaptCorr, P.adapt0, [0 1 0]);
    for b = 1:nBlocks
        for c = Shuffle(P.tests)
            fixdot(); Screen('Flip', win); WaitSecs(P.gap);
            play(c, P.testS, [1 0 0]);
            k = waitKey({'d', 'k'});
            fprintf(fid, '%g,%d,%g,%d\n', adaptCorr, b, c, strcmp(k, 'k'));
            play(adaptCorr, P.topUp, [0 1 0]);
        end
    end
catch err
    if ~strcmp(err.identifier, 'gc:quit'), fclose(fid); sca; rethrow(err); end
end
fclose(fid); sca; fprintf('Saved %s\n', fn);

    function fixdot()
        Screen('FillRect', win, 1, CenterRectOnPoint([0 0 8 8], cx, cy));
    end
    function play(corr, secs, col)
        r = rmin + rand(1, n) * (rmax - rmin); th = rand(1, n) * 2 * pi; d = 2 * (rand(1, n) < corr) - 1;
        stp = P.speed * ppd * ifi; vbl = Screen('Flip', win); nFrames = round(secs / ifi);
        for f = 1:nFrames
            r = r + d * stp; out = r > rmax | r < rmin; k = sum(out);
            if k, r(out) = sqrt(rmin ^ 2 + rand(1, k) * (rmax ^ 2 - rmin ^ 2)); th(out) = rand(1, k) * 2 * pi; end
            Screen('DrawDots', win, [r .* cos(th); r .* sin(th)], P.sizePx, col, [cx cy], 0);
            fixdot(); vbl = Screen('Flip', win, vbl + .5 * ifi);
            [down, ~, kc] = KbCheck; if down && kc(KbName('ESCAPE')), error('gc:quit', 'Escape pressed'); end
        end
        fixdot(); Screen('Flip', win);
    end
end

function [k, rt] = waitKey(names, t0)
% wait for one of the named keys (KbName names); Escape quits. rt from t0 (GetSecs) if given
if nargin < 2, t0 = GetSecs; end
codes = zeros(1, numel(names)); for i = 1:numel(names), c = KbName(names{i}); codes(i) = c(1); end
esc = KbName('ESCAPE'); KbReleaseWait;
while true
    [down, secs, kc] = KbCheck;
    if down
        if kc(esc), error('gc:quit', 'Escape pressed'); end
        hit = find(kc(codes), 1);
        if ~isempty(hit), k = names{hit}; rt = secs - t0; return; end
    end
    WaitSecs(0.001);
end
end
