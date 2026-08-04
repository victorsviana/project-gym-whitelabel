import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { RequireRole } from './app/RequireRole.tsx';
import { DemoModeScreen } from './features/auth/DemoModeScreen.tsx';
import { LoginScreen } from './features/auth/LoginScreen.tsx';
import { ProfileSelectScreen } from './features/auth/ProfileSelectScreen.tsx';
import { StudentSignupScreen } from './features/auth/StudentSignupScreen.tsx';
import { TrainerSignupScreen } from './features/auth/TrainerSignupScreen.tsx';
import { BrandScreen } from './features/gym/BrandScreen.tsx';
import { GymHome } from './features/gym/GymHome.tsx';
import { NoticesScreen } from './features/gym/notices/NoticesScreen.tsx';
import { StudentsScreen } from './features/gym/students/StudentsScreen.tsx';
import { PlanEditorScreen } from './features/gym/workouts/PlanEditorScreen.tsx';
import { WorkoutsScreen } from './features/gym/workouts/WorkoutsScreen.tsx';
import { DietScreen } from './features/student/diet/DietScreen.tsx';
import { OnboardingFlow } from './features/student/onboarding/OnboardingFlow.tsx';
import { ProfileScreen } from './features/student/profile/ProfileScreen.tsx';
import { SettingsScreen } from './features/student/profile/SettingsScreen.tsx';
import { StudentHome } from './features/student/StudentHome.tsx';
import { WorkoutDetailScreen } from './features/student/workout/WorkoutDetailScreen.tsx';
import { WorkoutListScreen } from './features/student/workout/WorkoutListScreen.tsx';
import { InstallPrompt } from './pwa/InstallPrompt.tsx';
import { UpdateNotifier } from './pwa/UpdateNotifier.tsx';
import { Showcase } from './showcase/Showcase.tsx';
import { seedIfEmpty } from './storage';

function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    seedIfEmpty().then(() => setReady(true));
  }, []);

  if (!ready) return null;

  return (
    <BrowserRouter>
      <InstallPrompt />
      <UpdateNotifier />
      <Routes>
        <Route path="/" element={<ProfileSelectScreen />} />
        <Route path="/entrar/:audience" element={<LoginScreen />} />
        <Route path="/cadastro/aluno" element={<StudentSignupScreen />} />
        <Route path="/cadastro/professor" element={<TrainerSignupScreen />} />
        <Route path="/demo" element={<DemoModeScreen />} />
        <Route path="/showcase" element={<Showcase />} />
        <Route
          path="/aluno"
          element={
            <RequireRole role="student">
              <StudentHome />
            </RequireRole>
          }
        />
        <Route
          path="/aluno/onboarding"
          element={
            <RequireRole role="student">
              <OnboardingFlow />
            </RequireRole>
          }
        />
        <Route
          path="/aluno/treino"
          element={
            <RequireRole role="student">
              <WorkoutListScreen />
            </RequireRole>
          }
        />
        <Route
          path="/aluno/treino/:planId"
          element={
            <RequireRole role="student">
              <WorkoutDetailScreen />
            </RequireRole>
          }
        />
        <Route
          path="/aluno/dieta"
          element={
            <RequireRole role="student">
              <DietScreen />
            </RequireRole>
          }
        />
        <Route
          path="/aluno/perfil"
          element={
            <RequireRole role="student">
              <ProfileScreen />
            </RequireRole>
          }
        />
        <Route
          path="/aluno/ajustes"
          element={
            <RequireRole role="student">
              <SettingsScreen />
            </RequireRole>
          }
        />
        <Route
          path="/gym"
          element={
            <RequireRole role="trainer">
              <GymHome />
            </RequireRole>
          }
        />
        <Route
          path="/gym/marca"
          element={
            <RequireRole role="trainer">
              <BrandScreen />
            </RequireRole>
          }
        />
        <Route
          path="/gym/alunos"
          element={
            <RequireRole role="trainer">
              <StudentsScreen />
            </RequireRole>
          }
        />
        <Route
          path="/gym/treinos"
          element={
            <RequireRole role="trainer">
              <WorkoutsScreen />
            </RequireRole>
          }
        />
        <Route
          path="/gym/treinos/:planId"
          element={
            <RequireRole role="trainer">
              <PlanEditorScreen />
            </RequireRole>
          }
        />
        <Route
          path="/gym/avisos"
          element={
            <RequireRole role="trainer">
              <NoticesScreen />
            </RequireRole>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
