# Frontend-Backend Integration Plan

## Overview
This document outlines the plan for integrating the frontend React application with the FastAPI backend, replacing the current mock data system with real API calls. The integration will be done incrementally to ensure stability and maintainability.

## Technology Stack
- Frontend: React + TypeScript
- State Management: TanStack Query (React Query)
- HTTP Client: Axios
- UI Components: Existing component library with Tailwind CSS
- API: FastAPI backend running on `http://localhost:8000`

## Phase 1: API Client Setup & Data Transformation Layer

### 1.1 API Client Setup
Create a centralized API client using Axios:

```typescript
// src/lib/api/client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### 1.2 Data Transformation Layer
Create type definitions and transformation utilities:

```typescript
// src/lib/api/types.ts
export interface ApiTeam {
  id: number;
  name: string;
  owner_name: string;
  initial_purse: number;
  current_purse: number;
  total_points?: number;
  rank?: number;
  rank_change?: number;
}

export interface Team {
  id: number;
  name: string;
  ownerName: string;
  initialPurse: number;
  currentPurse: number;
  points: number;
  rank: number;
  change: number;
}

// Add similar interfaces for Player, Match, and Score

// src/lib/api/transforms.ts
import { ApiTeam, Team } from './types';

export const transformTeam = (team: ApiTeam): Team => ({
  id: team.id,
  name: team.name,
  ownerName: team.owner_name,
  initialPurse: team.initial_purse,
  currentPurse: team.current_purse,
  points: team.total_points || 0,
  rank: team.rank || 0,
  change: team.rank_change || 0,
});

// Add similar transforms for other entities
```

## Phase 2: State Management with React Query

### 2.1 Query Hooks
Create custom hooks for data fetching:

```typescript
// src/lib/hooks/useTeams.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { transformTeam } from '../api/transforms';

export const useTeams = () => {
  return useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data } = await apiClient.get('/teams');
      return data.map(transformTeam);
    },
  });
};

export const useCreateTeam = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newTeam) => {
      const { data } = await apiClient.post('/teams', newTeam);
      return transformTeam(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
  });
};

// Add similar hooks for other entities
```

## Phase 3: Incremental Integration

### 3.1 Teams Integration
1. Update Teams page to use real data:
   - Replace mock data with useTeams hook
   - Add loading states using Skeleton components
   - Implement error handling
   - Test CRUD operations

### 3.2 Players Integration
1. Update Players page:
   - Replace mock data with usePlayers hook
   - Add filtering by role and team
   - Implement search functionality
   - Add loading and error states

### 3.3 Matches Integration
1. Update Matches page:
   - Implement match scheduling
   - Add match status updates
   - Create match details view
   - Add loading and error states

### 3.4 Scores Integration
1. Update Scores page:
   - Implement score submission
   - Add validation
   - Create score history view
   - Add loading and error states

### 3.5 Dashboard Integration
1. Update Dashboard widgets:
   - Implement real-time leaderboard
   - Add top performers list
   - Show recent and upcoming matches
   - Add loading states for all widgets

## Phase 4: Error Handling & Loading States

### 4.1 Error Components
```typescript
// src/components/ui/error-state.tsx
interface ErrorStateProps {
  message: string;
  retry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, retry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <p className="text-destructive">{message}</p>
      {retry && (
        <Button onClick={retry} variant="outline" className="mt-4">
          Retry
        </Button>
      )}
    </div>
  );
};
```

### 4.2 Loading Components
```typescript
// src/components/ui/loading-states.tsx
export const TableSkeleton = () => {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
};

export const CardSkeleton = () => {
  return (
    <div className="space-y-4">
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
};
```

## Phase 5: Testing & Cleanup

### 5.1 Integration Tests
1. Add tests for:
   - API client functionality
   - Data transformations
   - Component integration
   - Error handling
   - Loading states

### 5.2 Cleanup
1. Remove mock data files
2. Update documentation
3. Clean up unused imports
4. Remove deprecated code

### 5.3 Performance Optimization
1. Implement query caching
2. Add prefetching for common queries
3. Optimize bundle size
4. Add performance monitoring

## Implementation Timeline
1. Phase 1: 1-2 days
2. Phase 2: 1-2 days
3. Phase 3: 4-5 days (1 day per feature)
4. Phase 4: 1-2 days
5. Phase 5: 2-3 days

Total estimated time: 9-14 days

## Success Criteria
1. All mock data replaced with real API calls
2. Zero TypeScript errors
3. Proper error handling throughout the application
4. Smooth loading states for all data fetching
5. Comprehensive test coverage
6. No performance regressions

## Next Steps
1. Begin with Phase 1: API Client Setup
2. Create necessary type definitions
3. Implement data transformation layer
4. Start incremental feature integration with Teams page 