/**
 * NameTagCollection component.
 *
 * Displays all earned Name_Tags, indicates which is currently equipped, and
 * shows the ability description for each.  Allows the user to equip a tag by
 * clicking it.
 *
 * Requirement 10.6 — WHEN a user views the Name_Tag collection, THE
 * Application SHALL display all earned Name_Tags, indicate which is currently
 * equipped, and show the ability description for each.
 *
 * Requirement 10.2 — THE Application SHALL allow the user to equip exactly
 * one Name_Tag at a time from the user's collected Name_Tags.
 */

import type { NameTag, NameTagState } from './nameTag';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface NameTagCollectionProps {
  /** The current Name_Tag state (collection + equipped tag). */
  nameTagState: NameTagState;
  /**
   * Callback invoked when the user clicks a tag to equip it.
   * Receives the atomic number of the tag to equip.
   */
  onEquip: (atomicNumber: number) => void;
}

// ---------------------------------------------------------------------------
// Sub-component: individual Name_Tag card
// ---------------------------------------------------------------------------

interface NameTagCardProps {
  tag: NameTag;
  isEquipped: boolean;
  onEquip: (atomicNumber: number) => void;
}

function NameTagCard({ tag, isEquipped, onEquip }: NameTagCardProps) {
  const handleEquip = () => {
    if (!isEquipped) {
      onEquip(tag.atomicNumber);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleEquip();
    }
  };

  return (
    <div
      className={`name-tag-card${isEquipped ? ' name-tag-card--equipped' : ''}`}
      role="button"
      tabIndex={0}
      aria-pressed={isEquipped}
      aria-label={`${tag.name} Name Tag${isEquipped ? ', currently equipped' : ''}`}
      onClick={handleEquip}
      onKeyDown={handleKeyDown}
      style={{
        border: isEquipped ? '2px solid #FFC107' : '2px solid #555',
        borderRadius: '8px',
        padding: '12px',
        cursor: isEquipped ? 'default' : 'pointer',
        backgroundColor: isEquipped ? '#2a2200' : '#1a1a1a',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        transition: 'border-color 0.2s, background-color 0.2s',
        outline: 'none',
      }}
    >
      {/* Header row: symbol + name + equipped badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        {/* Element symbol badge */}
        <span
          aria-hidden="true"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '6px',
            backgroundColor: isEquipped ? '#FFC107' : '#333',
            color: isEquipped ? '#000' : '#fff',
            fontWeight: 'bold',
            fontSize: '1rem',
            flexShrink: 0,
          }}
        >
          {tag.symbol}
        </span>

        {/* Name + atomic number */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontWeight: 'bold',
              color: isEquipped ? '#FFC107' : '#e0e0e0',
              fontSize: '0.95rem',
            }}
          >
            {tag.name}
          </div>
          <div style={{ color: '#888', fontSize: '0.75rem' }}>
            #{tag.atomicNumber}
          </div>
        </div>

        {/* Equipped indicator */}
        {isEquipped && (
          <span
            aria-label="Equipped"
            style={{
              backgroundColor: '#FFC107',
              color: '#000',
              borderRadius: '4px',
              padding: '2px 6px',
              fontSize: '0.7rem',
              fontWeight: 'bold',
              flexShrink: 0,
            }}
          >
            EQUIPPED
          </span>
        )}
      </div>

      {/* Ability description */}
      <p
        style={{
          margin: 0,
          color: '#bbb',
          fontSize: '0.8rem',
          lineHeight: '1.4',
        }}
      >
        {tag.abilityDescription}
      </p>

      {/* Equip button (shown only when not equipped) */}
      {!isEquipped && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEquip(tag.atomicNumber);
          }}
          style={{
            marginTop: '4px',
            padding: '4px 10px',
            borderRadius: '4px',
            border: '1px solid #555',
            backgroundColor: '#333',
            color: '#e0e0e0',
            cursor: 'pointer',
            fontSize: '0.8rem',
            alignSelf: 'flex-start',
          }}
          aria-label={`Equip ${tag.name} Name Tag`}
        >
          Equip
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component: NameTagCollection
// ---------------------------------------------------------------------------

/**
 * Displays the full Name_Tag collection.
 *
 * - Shows all earned Name_Tags in a responsive grid.
 * - Highlights the currently equipped tag with a gold border and "EQUIPPED"
 *   badge.
 * - Shows the ability description for each tag.
 * - Allows equipping a tag via click or keyboard interaction.
 * - Shows an empty-state message when no tags have been earned yet.
 *
 * Requirement 10.6
 */
export function NameTagCollection({
  nameTagState,
  onEquip,
}: NameTagCollectionProps) {
  const { nameTags, equippedNameTag } = nameTagState;

  return (
    <section
      aria-label="Name Tag Collection"
      style={{
        padding: '16px',
        color: '#e0e0e0',
      }}
    >
      {/* Section heading */}
      <h2
        style={{
          margin: '0 0 4px 0',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          color: '#fff',
        }}
      >
        Name Tags
      </h2>

      {/* Subtitle / count */}
      <p
        style={{
          margin: '0 0 16px 0',
          color: '#888',
          fontSize: '0.85rem',
        }}
      >
        {nameTags.length === 0
          ? 'Defeat elements in Game Mode to earn Name Tags.'
          : `${nameTags.length} earned${equippedNameTag !== null ? ' · 1 equipped' : ''}`}
      </p>

      {/* Empty state */}
      {nameTags.length === 0 && (
        <div
          role="status"
          aria-live="polite"
          style={{
            textAlign: 'center',
            padding: '32px 16px',
            color: '#666',
            border: '1px dashed #444',
            borderRadius: '8px',
          }}
        >
          No Name Tags earned yet. Defeat an element for the first time to earn
          its Name Tag.
        </div>
      )}

      {/* Tag grid */}
      {nameTags.length > 0 && (
        <ul
          aria-label="Earned Name Tags"
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '12px',
          }}
        >
          {nameTags.map((tag) => (
            <li key={tag.atomicNumber}>
              <NameTagCard
                tag={tag}
                isEquipped={equippedNameTag === tag.atomicNumber}
                onEquip={onEquip}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default NameTagCollection;
