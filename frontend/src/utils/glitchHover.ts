const GLITCH_CHARS = '0123456789ABCDEF#%&*<>+/?!@§$';

function getTextNodes(node: Node): Text[] {
  const textNodes: Text[] = [];
  const walk = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, {
    acceptNode(n) {
      if (!n.textContent || !n.textContent.trim()) return NodeFilter.FILTER_REJECT;
      const parent = n.parentElement;
      if (parent && (
        parent.tagName === 'SCRIPT' || 
        parent.tagName === 'STYLE' || 
        parent.tagName === 'SVG' || 
        parent.closest('svg')
      )) {
        return NodeFilter.FILTER_REJECT;
      }
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  let current = walk.nextNode();
  while (current) {
    textNodes.push(current as Text);
    current = walk.nextNode();
  }
  return textNodes;
}

export function initGlobalGlitchHover(): () => void {
  const activeElements = new WeakMap<HTMLElement, { restore: () => void }>();

  const handleMouseOver = (e: MouseEvent) => {
    // Target interactive buttons, links, and role="button" elements
    const target = (e.target as HTMLElement | null)?.closest('button, a, [role="button"]') as HTMLElement | null;
    if (!target) return;

    // Skip if already actively glitching or disabled
    if (activeElements.has(target)) return;
    if (target.hasAttribute('disabled') || target.getAttribute('aria-disabled') === 'true') return;

    const textNodes = getTextNodes(target);
    if (textNodes.length === 0) return;

    // Snapshot original text values for every text node
    const snapshots = textNodes.map(tn => ({ node: tn, text: tn.textContent || '' }));
    target.classList.add('glitch-hover-text');

    let frame = 0;
    const maxFrames = 7; // ~245ms crisp tactical burst
    let intervalId: ReturnType<typeof setInterval>;

    const restore = () => {
      clearInterval(intervalId);
      target?.classList.remove('glitch-hover-text');
      snapshots.forEach(({ node, text }) => {
        try {
          node.textContent = text;
        } catch {}
      });
      activeElements.delete(target);
      target?.removeEventListener('mouseleave', onMouseLeave);
      target?.removeEventListener('click', onClick);
    };

    const onMouseLeave = () => restore();
    const onClick = () => restore();

    activeElements.set(target, { restore });
    target.addEventListener('mouseleave', onMouseLeave, { once: true });
    target.addEventListener('click', onClick, { once: true });

    intervalId = setInterval(() => {
      frame++;
      if (frame >= maxFrames) {
        restore();
      } else {
        snapshots.forEach(({ node, text }) => {
          const scrambled = text
            .split('')
            .map(char => {
              if (/\s/.test(char)) return char;
              // 60% chance to glitch each non-space character
              return Math.random() < 0.6
                ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
                : char;
            })
            .join('');
          node.textContent = scrambled;
        });
      }
    }, 35);
  };

  document.addEventListener('mouseover', handleMouseOver);

  return () => {
    document.removeEventListener('mouseover', handleMouseOver);
  };
}

