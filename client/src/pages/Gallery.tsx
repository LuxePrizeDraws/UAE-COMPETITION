import './FeaturePages.css';
import GalleryGrid, { GalleryItem } from '../components/GalleryGrid';

const galleryItems: GalleryItem[] = [
  {
    id: 'winners-1',
    title: 'Winner Celebration Night',
    caption: 'Highlights from our latest live draw winner reveal event.',
    tag: 'Events',
    accent: 'linear-gradient(135deg, #2c1810 0%, #c9a84c 100%)',
    emoji: '🏆',
  },
  {
    id: 'chess-1',
    title: 'Chess Masters Qualifier',
    caption: 'Top players battling through strategic rapid rounds.',
    tag: 'Chess',
    accent: 'linear-gradient(135deg, #1d2b64 0%, #f8cdda 100%)',
    emoji: '♟️',
  },
  {
    id: 'connect4-1',
    title: 'Connect 4 Bracket Finals',
    caption: 'The final matchups from the double-elimination finals.',
    tag: 'Connect 4',
    accent: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
    emoji: '🔴',
  },
  {
    id: 'community-1',
    title: 'Community Meetup',
    caption: 'A snapshot of players, creators, and support staff together.',
    tag: 'Community',
    accent: 'linear-gradient(135deg, #42275a 0%, #734b6d 100%)',
    emoji: '🤝',
  },
  {
    id: 'studio-1',
    title: 'Live Draw Studio Setup',
    caption: 'Transparent draw equipment and stream setup preview.',
    tag: 'Behind the scenes',
    accent: 'linear-gradient(135deg, #0f2027 0%, #2c5364 100%)',
    emoji: '🎥',
  },
  {
    id: 'support-1',
    title: 'Support Team Spotlight',
    caption: 'Our support specialists helping users with calm, clear guidance.',
    tag: 'Support',
    accent: 'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)',
    emoji: '💬',
  },
];

export default function Gallery() {
  return (
    <section className="feature-page">
      <div className="feature-page__hero">
        <h1>Platform Gallery</h1>
        <p>Reusable sample gallery cards. Replace captions and artwork with your real campaign/media assets anytime.</p>
      </div>
      <GalleryGrid items={galleryItems} />
    </section>
  );
}
