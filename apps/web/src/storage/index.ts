export { createActivityRepository } from './activity-repository';
export { createExecutionRepository } from './execution-repository';
export { createGymRepository } from './gym-repository';
export { createNoticeRepository } from './notice-repository';
export { createNutritionRepository } from './nutrition-repository';
export { seedIfEmpty } from './seed';
export { createStudentRepository } from './student-repository';
export { createUserRepository } from './user-repository';
export { createWorkoutRepository } from './workout-repository';

import { createActivityRepository } from './activity-repository';
import { createExecutionRepository } from './execution-repository';
import { createGymRepository } from './gym-repository';
import { createNoticeRepository } from './notice-repository';
import { createNutritionRepository } from './nutrition-repository';
import { createStudentRepository } from './student-repository';
import { createUserRepository } from './user-repository';
import { createWorkoutRepository } from './workout-repository';

/** Instâncias únicas consumidas pelas telas — trocar por fakes em teste chamando as factories acima. */
export const gymRepository = createGymRepository();
export const userRepository = createUserRepository();
export const studentRepository = createStudentRepository();
export const workoutRepository = createWorkoutRepository();
export const executionRepository = createExecutionRepository();
export const nutritionRepository = createNutritionRepository();
export const activityRepository = createActivityRepository();
export const noticeRepository = createNoticeRepository();
