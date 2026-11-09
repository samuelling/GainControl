function gc_search(kind, varargin)
% GC_SEARCH  GAIN CONTROL perception console, lab version: VISUAL SEARCH (PS 327 Lab 03)
%
%   STARTER CODE. Written in part with Claude (Anthropic's AI model) and checked only so far: it runs the same
%   design as the console, but nobody has validated it on your hardware. Before you collect real data, check
%   the timing (frame rate, durations), the stimulus sizes and luminances, the randomisation and
%   counterbalancing, and the data file it writes. Dot your i's and cross your coding t's.
%
%   Treisman, A. M., & Gelade, G. (1980). A feature-integration theory of attention. Cognitive Psychology, 12(1), 97-136.
%
%   Find the target: K if it's there, D if it isn't, as fast as you can.
%   gc_search('popout')  a red B among green As                      set sizes 2,4,8,16 (10 blocks)
%   gc_search('conj')    a red B among green Bs and red As           set sizes 2,4,8,16 (10 blocks)
%   gc_search('line')    a line tilted 15 deg among vertical lines   set sizes 5,10,15,20 (3 blocks)
%   Add 'quick' for a quarter of the blocks (at least 2). Escape quits (data so far are saved).
%   Output: data/search_<kind>_<participant>_<date>.csv
%           columns: block, set_size, n_a, n_b, present, said_present, rt_ms

% ---- your setup ----
screenNumber = max(Screen('Screens'));
SCALE = 1.2;            % original lab pixels -> screen pixels (the console uses 1.2)
skipSyncTests = false;

if nargin < 1, kind = 'popout'; end
quick = any(strcmpi(varargin, 'quick'));
switch kind
    case 'popout', C = struct('what', 'a red B among green As', 'A', {{'A', [0 1 0]}}, 'B', {{'A', [0 1 0]}}, 'nA', [1 2 4 8], 'nB', [1 2 4 8], 'blocks', 10, 'fix', .5, 'line', false);
    case 'conj', C = struct('what', 'a red B among green Bs and red As', 'A', {{'A', [0 1 0]; 'A', [1 0 0]}}, 'B', {{'B', [0 1 0]}}, 'nA', [1 2 4 8], 'nB', [1 2 4 8], 'blocks', 10, 'fix', .5, 'line', false);
    otherwise, C = struct('what', 'a line tilted 15 degrees among vertical lines', 'A', {{}}, 'B', {{}}, 'nA', [5 10 15 20], 'nB', [0 0 0 0], 'blocks', 3, 'fix', .25, 'line', true);
end
nBlocks = C.blocks; if quick, nBlocks = max(2, floor(C.blocks / 4)); end
R = 200 * SCALE; ITEM = 30 * SCALE;

participant = input('Participant ID: ', 's'); if isempty(participant), participant = 'anon'; end
here = fileparts(mfilename('fullpath')); if ~exist(fullfile(here, 'data'), 'dir'), mkdir(fullfile(here, 'data')); end
fn = fullfile(here, 'data', sprintf('search_%s_%s_%s.csv', kind, participant, datestr(now, 'yyyy-mm-dd_HHMM')));
fid = fopen(fn, 'w'); fprintf(fid, 'block,set_size,n_a,n_b,present,said_present,rt_ms\n');

PsychDefaultSetup(2); KbName('UnifyKeyNames');
if skipSyncTests, Screen('Preference', 'SkipSyncTests', 1); end
try
    [win, rect] = PsychImaging('OpenWindow', screenNumber, [0 0 0]);
    [cx, cy] = RectCenter(rect); Screen('TextSize', win, 26); HideCursor;
    msg(win, sprintf('Target: %s.\n\nK if it is there, D if it is not. Fast, but try not to make mistakes.\nEyes on the dot between trials.\n\nSPACE to start.', C.what));
    types = [];
    for i = 1:numel(C.nA), types = [types; C.nA(i) C.nB(i) 0; C.nA(i) C.nB(i) 1]; end %#ok<AGROW>
    for b = 1:nBlocks
        order = types(randperm(size(types, 1)), :);
        for t = 1:size(order, 1)
            nA = order(t, 1); nB = order(t, 2); present = order(t, 3); n = nA + nB;
            Screen('FillRect', win, [1 1 1], CenterRectOnPoint([0 0 6 6], cx, cy)); Screen('Flip', win); WaitSecs(C.fix);
            P = positions(n, R, ITEM); tIdx = -1; if present, tIdx = randi(n); end
            for k = 1:n
                x = cx + P(k, 1); y = cy + P(k, 2);
                if C.line
                    ang = 90; if k == tIdx, ang = 75; end
                    L = 20 * SCALE;
                    Screen('DrawLine', win, [1 0 0], x - L / 2 * cosd(ang), y - L / 2 * sind(ang), x + L / 2 * cosd(ang), y + L / 2 * sind(ang), 2.4);
                else
                    if k == tIdx, ch = 'B'; col = [1 0 0];
                    else
                        pool = C.B; if k <= nA, pool = C.A; end
                        j = randi(size(pool, 1)); ch = pool{j, 1}; col = pool{j, 2};
                    end
                    Screen('TextSize', win, round(ITEM)); Screen('TextStyle', win, 1);
                    DrawFormattedText(win, ch, 'center', 'center', col, [], [], [], [], [], CenterRectOnPoint([0 0 ITEM ITEM], x, y));
                    Screen('TextSize', win, 26); Screen('TextStyle', win, 0);
                end
            end
            t0 = Screen('Flip', win);
            [k, rt] = waitKey({'d', 'k'}, t0);
            fprintf(fid, '%d,%d,%d,%d,%d,%d,%.1f\n', b, n, nA, nB, present, strcmp(k, 'k'), rt * 1000);
            Screen('Flip', win); WaitSecs(.4 + .1 * C.line);
        end
    end
    msg(win, 'Done. Thank you!', false); WaitSecs(1.5);
catch err
    if ~strcmp(err.identifier, 'gc:quit'), fclose(fid); sca; rethrow(err); end
end
fclose(fid); sca; fprintf('Saved %s\n', fn);
end

function out = positions(n, R, ITEM)
out = zeros(0, 2); tries = 0;
while size(out, 1) < n && tries < 5000
    tries = tries + 1; r = R * sqrt(rand); a = rand * 2 * pi; x = r * cos(a); y = r * sin(a);
    if hypot(x, y) < ITEM && n > 1, continue; end
    if isempty(out) || all(hypot(out(:, 1) - x, out(:, 2) - y) > ITEM * 1.5), out(end + 1, :) = [x y]; end %#ok<AGROW>
end
end

function msg(win, text, wait)
if nargin < 3, wait = true; end
DrawFormattedText(win, text, 'center', 'center', [1 1 1]); Screen('Flip', win);
if wait, waitKey({'space', 'Return'}); end
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
