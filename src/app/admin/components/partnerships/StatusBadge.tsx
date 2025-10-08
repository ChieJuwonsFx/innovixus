interface Props {
  status: string | null;
  type: 'payment' | 'event';
}

export default function StatusBadge({ status, type }: Props) {
  if (!status || status === 'N/A') {
    return null;
  }

  const paymentStyles: { [key: string]: string } = {
    'Paid': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'Canceled': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    'Unpaid': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
  };

  const eventStyles: { [key: string]: string } = {
    'Success': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'Canceled': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  };

  const styles = type === 'payment' ? paymentStyles : eventStyles;
  const style = styles[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold inline-block ${style}`}>
      {status}
    </span>
  );
}