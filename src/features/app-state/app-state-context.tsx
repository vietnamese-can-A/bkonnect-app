import { createContext, type PropsWithChildren, useContext, useMemo, useReducer } from 'react';

import { calculateMatch, MATCH_THRESHOLD } from '@/features/matches/calculate-match';
import {
  currentUser,
  seedFoundPosts,
  seedLostReports,
  seedMatches,
  seedUsers,
} from '@/features/posts/mock-data';
import type {
  CreateResult,
  FoundPost,
  LostReport,
  Match,
  NewFoundPostInput,
  NewLostReportInput,
  User,
} from '@/types/domain';

type AppState = {
  users: User[];
  currentUser: User;
  lostReports: LostReport[];
  foundPosts: FoundPost[];
  matches: Match[];
};

type AppAction =
  | { type: 'SWITCH_USER'; userId: string }
  | { type: 'ADD_LOST_REPORT'; report: LostReport; matches: Match[] }
  | { type: 'ADD_FOUND_POST'; post: FoundPost; matches: Match[] }
  | { type: 'MARK_MATCH_READ'; matchId: string }
  | { type: 'DISMISS_MATCH'; matchId: string }
  | { type: 'COMPLETE_MATCH'; matchId: string };

type AppStateContextValue = AppState & {
  switchUser: (userId: string) => void;
  createLostReport: (input: NewLostReportInput) => CreateResult;
  createFoundPost: (input: NewFoundPostInput) => CreateResult;
  markMatchRead: (matchId: string) => void;
  dismissMatch: (matchId: string) => void;
  completeMatch: (matchId: string) => void;
  getUser: (userId: string) => User | undefined;
};

const initialState: AppState = {
  users: seedUsers,
  currentUser,
  lostReports: seedLostReports,
  foundPosts: seedFoundPosts,
  matches: seedMatches,
};

let localIdCounter = 0;

function createId(prefix: string) {
  localIdCounter += 1;
  return `${prefix}-${Date.now()}-${localIdCounter}`;
}

function buildPotentialMatches(
  lostReports: LostReport[],
  foundPosts: FoundPost[],
  existingMatches: Match[],
) {
  const existingPairs = new Set(
    existingMatches.map((match) => `${match.lostReportId}:${match.foundPostId}`),
  );
  const matches: Match[] = [];

  lostReports
    .filter((report) => report.status === 'SEARCHING')
    .forEach((report) => {
      foundPosts
        .filter((post) => post.status === 'OPEN')
        .forEach((post) => {
          const pairKey = `${report.id}:${post.id}`;
          if (existingPairs.has(pairKey)) return;

          const calculation = calculateMatch(report, post);
          if (calculation.score < MATCH_THRESHOLD) return;

          existingPairs.add(pairKey);
          matches.push({
            id: createId('match'),
            lostReportId: report.id,
            foundPostId: post.id,
            score: calculation.score,
            reasons: calculation.reasons,
            status: 'POSSIBLE',
            isRead: false,
            createdAt: new Date().toISOString(),
          });
        });
    });

  return matches;
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SWITCH_USER': {
      const nextUser = state.users.find((user) => user.id === action.userId);
      return nextUser ? { ...state, currentUser: nextUser } : state;
    }
    case 'ADD_LOST_REPORT':
      return {
        ...state,
        lostReports: [action.report, ...state.lostReports],
        matches: [...action.matches, ...state.matches],
      };
    case 'ADD_FOUND_POST':
      return {
        ...state,
        foundPosts: [action.post, ...state.foundPosts],
        matches: [...action.matches, ...state.matches],
      };
    case 'MARK_MATCH_READ':
      return {
        ...state,
        matches: state.matches.map((match) =>
          match.id === action.matchId ? { ...match, isRead: true } : match,
        ),
      };
    case 'DISMISS_MATCH':
      return {
        ...state,
        matches: state.matches.map((match) =>
          match.id === action.matchId && match.status === 'POSSIBLE'
            ? { ...match, status: 'DISMISSED', isRead: true }
            : match,
        ),
      };
    case 'COMPLETE_MATCH': {
      const completedMatch = state.matches.find(
        (match) => match.id === action.matchId && match.status === 'POSSIBLE',
      );
      if (!completedMatch) return state;

      return {
        ...state,
        lostReports: state.lostReports.map((report) =>
          report.id === completedMatch.lostReportId
            ? { ...report, status: 'RECOVERED' }
            : report,
        ),
        foundPosts: state.foundPosts.map((post) =>
          post.id === completedMatch.foundPostId ? { ...post, status: 'RETURNED' } : post,
        ),
        matches: state.matches.map((match) => {
          if (match.id === completedMatch.id) {
            return { ...match, status: 'COMPLETED', isRead: true };
          }

          const conflictsWithCompletion =
            match.status === 'POSSIBLE' &&
            (match.lostReportId === completedMatch.lostReportId ||
              match.foundPostId === completedMatch.foundPostId);

          return conflictsWithCompletion
            ? { ...match, status: 'DISMISSED', isRead: true }
            : match;
        }),
      };
    }
    default:
      return state;
  }
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const value = useMemo<AppStateContextValue>(
    () => ({
      ...state,
      switchUser: (userId) => dispatch({ type: 'SWITCH_USER', userId }),
      createLostReport: (input) => {
        const report: LostReport = {
          ...input,
          id: createId('lost'),
          ownerId: state.currentUser.id,
          status: 'SEARCHING',
          createdAt: new Date().toISOString(),
        };
        const matches = buildPotentialMatches([report], state.foundPosts, state.matches);
        dispatch({ type: 'ADD_LOST_REPORT', report, matches });
        return { id: report.id, matchCount: matches.length };
      },
      createFoundPost: (input) => {
        const post: FoundPost = {
          ...input,
          id: createId('found'),
          finderId: state.currentUser.id,
          status: 'OPEN',
          createdAt: new Date().toISOString(),
        };
        const matches = buildPotentialMatches(state.lostReports, [post], state.matches);
        dispatch({ type: 'ADD_FOUND_POST', post, matches });
        return { id: post.id, matchCount: matches.length };
      },
      markMatchRead: (matchId) => dispatch({ type: 'MARK_MATCH_READ', matchId }),
      dismissMatch: (matchId) => dispatch({ type: 'DISMISS_MATCH', matchId }),
      completeMatch: (matchId) => dispatch({ type: 'COMPLETE_MATCH', matchId }),
      getUser: (userId) => state.users.find((user) => user.id === userId),
    }),
    [state],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('useAppState must be used inside AppStateProvider');
  }

  return context;
}
