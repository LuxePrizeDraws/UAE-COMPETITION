import './RecentWinners.css';

interface Winner {
  id: string;
  prizeAmount: string;
  prizeType: string;
  dateWon: string;
}

const RECENT_WINNERS: Winner[] = [
  { id: 'Winner #A102', prizeAmount: '£50,000', prizeType: 'Cash Draw', dateWon: '30 Aug 2026' },
  { id: 'Winner #B447', prizeAmount: '£10,000', prizeType: 'Cash Draw', dateWon: '27 Aug 2026' },
  { id: 'Winner #C933', prizeAmount: 'Ferrari 488 GTB', prizeType: 'Vehicle', dateWon: '22 Aug 2026' },
  { id: 'Winner #D210', prizeAmount: '£100,000', prizeType: 'Luxury Experience', dateWon: '19 Aug 2026' },
  { id: 'Winner #E571', prizeAmount: 'Lamborghini Huracán', prizeType: 'Vehicle', dateWon: '12 Aug 2026' },
  { id: 'Winner #F884', prizeAmount: '£500,000', prizeType: 'Cash Draw', dateWon: '08 Aug 2026' },
];

export default function RecentWinners({ title = 'Recent Winners' }: { title?: string }) {
  return (
    <section className="recent-winners">
      <h2 className="recent-winners__title">🏆 {title}</h2>
      <div className="recent-winners__grid" role="table" aria-label="Recent competition winners">
        {RECENT_WINNERS.map((winner) => (
          <div className="winner-card" role="row" key={winner.id}>
            <div className="winner-card__cell" role="cell">
              <span className="winner-card__label">Winner</span>
              <strong>{winner.id}</strong>
            </div>
            <div className="winner-card__cell" role="cell">
              <span className="winner-card__label">Prize Amount</span>
              <strong>{winner.prizeAmount}</strong>
            </div>
            <div className="winner-card__cell" role="cell">
              <span className="winner-card__label">Prize Type</span>
              <strong>{winner.prizeType}</strong>
            </div>
            <div className="winner-card__cell" role="cell">
              <span className="winner-card__label">Date Won</span>
              <strong>{winner.dateWon}</strong>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
