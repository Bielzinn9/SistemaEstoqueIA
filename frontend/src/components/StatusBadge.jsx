import { ROTULO_STATUS } from '../utils';

export default function StatusBadge({ status }) {
  return (
    <span className={`selo selo-${status}`}>{ROTULO_STATUS[status] || status}</span>
  );
}
