// Matches the Spraxe brand palette used across the website and customer app
// (navy-blue primary, orange accent), so this staff app feels like the same product family.
export const colors = {
  navy900: '#1E3A8A',
  navy800: '#1E40AF',
  navy50: '#EFF6FF',
  orange500: '#F97316',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray600: '#4B5563',
  gray900: '#111827',
  success: '#16A34A',
  warning: '#D97706',
  destructive: '#DC2626',
  white: '#FFFFFF',
  surfaceVariant: '#F1F5F9',
};

export type StatusColors = { bg: string; fg: string };

// Mirrors CommonComponents.kt statusColors()
export function statusColors(status: string): StatusColors {
  switch (status.toLowerCase()) {
    case 'open':
    case 'pending':
      return { bg: '#FEF3C7', fg: '#92400E' };
    case 'in_progress':
    case 'processing':
    case 'confirmed':
      return { bg: '#DBEAFE', fg: '#1E40AF' };
    case 'resolved':
    case 'delivered':
    case 'approved':
    case 'completed':
    case 'paid':
      return { bg: '#D1FAE5', fg: '#065F46' };
    case 'closed':
    case 'cancelled':
    case 'rejected':
    case 'failed':
      return { bg: '#FEE2E2', fg: '#991B1B' };
    default:
      return { bg: '#F3F4F6', fg: '#374151' };
  }
}
