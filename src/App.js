import React, { useState, useEffect } from 'react';

//const DATA_URL = 'https://hololive-cardgame.github.io/cards/cards.json';
const DATA_URL = 'https://raw.githubusercontent.com/hololive-cardgame/cards/main/cards.json';
const IMG_BASE = 'https://hololive-cardgame.github.io/cards/';

export default function App() {
  const [allCards, setAllCards] = useState([]);
  const [decks, setDecks] = useState(() => {
    const saved = localStorage.getItem('holo_decks');
    return saved ? JSON.parse(saved) : [{ name: '我的卡组 1', cards: {} }];
  });
  const [activeDeck, setActiveDeck] = useState(0);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(DATA_URL)
      .then((r) => r.json())
      .then((data) => {
        setAllCards(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    localStorage.setItem('holo_decks', JSON.stringify(decks));
  }, [decks]);

  useEffect(() => {
    if (search.length < 2) {
      setResults([]);
      return;
    }
    const q = search.toLowerCase();
    setResults(
      allCards
        .filter(
          (c) =>
            (c.id && c.id.toLowerCase().includes(q)) ||
            (c.name && c.name.toLowerCase().includes(q))
        )
        .slice(0, 15)
    );
  }, [search, allCards]);

  const deck = decks[activeDeck] || decks[0];
  const total = Object.values(deck.cards).reduce((a, b) => a + b, 0);

  function updateCount(id, delta) {
    setDecks((prev) => {
      const next = prev.map((d, i) => {
        if (i !== activeDeck) return d;
        const cur = d.cards[id] || 0;
        const val = Math.max(0, Math.min(4, cur + delta));
        const cards = { ...d.cards };
        if (val === 0) delete cards[id];
        else cards[id] = val;
        return { ...d, cards };
      });
      return next;
    });
  }

  function addDeck() {
    const name = prompt('卡组名称：', '我的卡组 ' + (decks.length + 1));
    if (!name) return;
    setDecks([...decks, { name, cards: {} }]);
    setActiveDeck(decks.length);
  }

  function renameDeck() {
    const name = prompt('新名称：', deck.name);
    if (!name) return;
    setDecks(decks.map((d, i) => (i === activeDeck ? { ...d, name } : d)));
  }

  function deleteDeck() {
    if (decks.length <= 1) {
      alert('至少保留一副卡组！');
      return;
    }
    if (!confirm('确定删除？')) return;
    const next = decks.filter((_, i) => i !== activeDeck);
    setDecks(next);
    setActiveDeck(Math.max(0, activeDeck - 1));
  }

  const deckCards = Object.keys(deck.cards)
    .map((id) => allCards.find((c) => c.id === id))
    .filter(Boolean);

  return (
    <div
      style={{
        fontFamily: 'sans-serif',
        maxWidth: 800,
        margin: '0 auto',
        padding: 16,
      }}
    >
      <h1 style={{ fontSize: 20, marginBottom: 12 }}>🃏 我的卡组管理器</h1>

      <div
        style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}
      >
        {decks.map((d, i) => (
          <button
            key={i}
            onClick={() => setActiveDeck(i)}
            style={{
              padding: '6px 14px',
              cursor: 'pointer',
              fontWeight: i === activeDeck ? 'bold' : 'normal',
              background: i === activeDeck ? '#e8e8e8' : 'white',
              border: '1px solid #ccc',
              borderRadius: 8,
            }}
          >
            {d.name}
          </button>
        ))}
        <button
          onClick={addDeck}
          style={{
            padding: '6px 14px',
            cursor: 'pointer',
            border: '1px solid #4a90d9',
            color: '#4a90d9',
            background: 'white',
            borderRadius: 8,
          }}
        >
          + 新卡组
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 12,
          alignItems: 'center',
        }}
      >
        <strong>{deck.name}</strong>
        <span style={{ fontSize: 12, color: '#888' }}>{total} 张</span>
        <button
          onClick={renameDeck}
          style={{ fontSize: 12, padding: '2px 8px', cursor: 'pointer' }}
        >
          改名
        </button>
        <button
          onClick={deleteDeck}
          style={{
            fontSize: 12,
            padding: '2px 8px',
            cursor: 'pointer',
            color: 'red',
          }}
        >
          删除
        </button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="搜索卡牌名称或编号..."
        style={{
          width: '100%',
          padding: 8,
          marginBottom: 8,
          borderRadius: 8,
          border: '1px solid #ccc',
          fontSize: 14,
        }}
      />

      {results.length > 0 && (
        <div
          style={{
            border: '1px solid #eee',
            borderRadius: 8,
            marginBottom: 12,
            maxHeight: 220,
            overflowY: 'auto',
          }}
        >
          {results.map((c) => (
            <div
              key={c.id}
              onClick={() => {
                updateCount(c.id, 1);
                setSearch('');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid #f0f0f0',
              }}
            >
              <img
                src={IMG_BASE + c.image}
                alt=""
                style={{
                  width: 32,
                  height: 44,
                  objectFit: 'cover',
                  borderRadius: 3,
                }}
                onError={(e) => (e.target.style.display = 'none')}
              />
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>
                  {c.nameZh || c.name || c.id}
                </div>
                <div style={{ fontSize: 11, color: '#888' }}>{c.id}</div>
              </div>
              <span
                style={{ marginLeft: 'auto', color: '#4a90d9', fontSize: 18 }}
              >
                +
              </span>
            </div>
          ))}
        </div>
      )}

      {loading && (
        <p style={{ color: '#888', textAlign: 'center' }}>
          正在加载卡牌数据库...
        </p>
      )}

      {deckCards.length === 0 && !loading && (
        <p style={{ color: '#aaa', textAlign: 'center', marginTop: 32 }}>
          卡组是空的，用上方搜索添加卡牌
        </p>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: 10,
        }}
      >
        {deckCards.map((card) => (
          <div
            key={card.id}
            style={{
              border: '1px solid #eee',
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            <img
              src={IMG_BASE + card.image}
              alt={card.nameZh || card.name}
              style={{ width: '100%', cursor: 'pointer' }}
              onClick={() => setModal(card)}
              onError={(e) => (e.target.style.display = 'none')}
            />
            <div style={{ padding: '6px 8px' }}>
              <div style={{ fontSize: 12, fontWeight: 500 }}>
                {card.nameZh || card.name || card.id}
              </div>
              <div style={{ fontSize: 11, color: '#888' }}>{card.id}</div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  marginTop: 4,
                }}
              >
                <button
                  onClick={() => updateCount(card.id, -1)}
                  style={{ width: 22, height: 22, cursor: 'pointer' }}
                >
                  −
                </button>
                <span style={{ flex: 1, textAlign: 'center', fontSize: 13 }}>
                  {deck.cards[card.id]}
                </span>
                <button
                  onClick={() => updateCount(card.id, 1)}
                  style={{ width: 22, height: 22, cursor: 'pointer' }}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div
          onClick={() => setModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: 12,
              padding: 20,
              maxWidth: 380,
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
          >
            <img
              src={IMG_BASE + modal.image}
              alt=""
              style={{ width: '100%', borderRadius: 8, marginBottom: 12 }}
              onError={(e) => (e.target.style.display = 'none')}
            />
            <h3 style={{ fontSize: 16, marginBottom: 4 }}>
              {modal.nameZh || modal.name}
            </h3>
            <p style={{ fontSize: 12, color: '#888', marginBottom: 12 }}>
              {modal.id}
            </p>
            <pre
              style={{
                fontSize: 12,
                color: '#444',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.6,
              }}
            >
              {[
                modal.type && '类型：' + modal.type,
                modal.color && '颜色：' + modal.color,
                modal.life && 'Life：' + modal.life,
                modal.oshiSkill &&
                  '\n推し技能：' +
                    modal.oshiSkill.name +
                    '\n' +
                    modal.oshiSkill.effect,
                modal.spSkill &&
                  '\nSP技能：' +
                    modal.spSkill.name +
                    '\n' +
                    modal.spSkill.effect,
              ]
                .filter(Boolean)
                .join('\n')}
            </pre>
            <button
              onClick={() => setModal(null)}
              style={{
                marginTop: 12,
                width: '100%',
                padding: 8,
                cursor: 'pointer',
              }}
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
