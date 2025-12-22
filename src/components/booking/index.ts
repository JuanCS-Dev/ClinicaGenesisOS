/**
 * Booking Components
 *
 * Components for public appointment booking flow.
 */

export {
  ProfessionalSelector,
  type PublicProfessional,
} from './ProfessionalSelector';

export {
  AvailabilityCalendar,
  generateDaySlots,
  type TimeSlot,
  type DayAvailability,
} from './AvailabilityCalendar';

export {
  StepIndicator,
  PatientInfoForm,
  BookingSummary,
  type BookingStep,
  type PatientInfo,
  type ClinicInfo,
} from './BookingComponents';
