import { useEffect, useRef, useState } from 'react';
import { embedAgentforceClient } from '@salesforce/agentforce-conversation-client';
import { MessageSquare, X, ChevronDown, Check } from 'lucide-react';

const AGENT_ID = '0XxV90000001ZTZKA2';
const ORG_ORIGIN = window.location.origin;

const AGENTS = [
  { id: 'agentforce', label: 'Agentforce',  tag: 'Salesforce', color: '#c9a96e' },
  { id: 'opus',       label: 'Opus 4.7',    tag: 'Anthropic',  color: '#8b5cf6' },
  { id: 'gpt',        label: 'GPT 5.5 Pro', tag: 'OpenAI',     color: '#10a37f' },
] as const;
type AgentId = typeof AGENTS[number]['id'];

export function AgentforceChat() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentId>('agentforce');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dropdownOpen]);

  // Prevent dropdown click from bubbling to backdrop
  const stopProp = (e: React.MouseEvent) => e.stopPropagation();

  // ACC iframe must always have real dimensions — use opacity/pointerEvents,
  // never display:none or height:0 on the container.
  useEffect(() => {
    if (mounted.current || !containerRef.current) return;
    mounted.current = true;

    try {
      embedAgentforceClient({
        container: containerRef.current,
        salesforceOrigin: ORG_ORIGIN,
        agentforceClientConfig: {
          agentId: AGENT_ID,
          renderingConfig: {
            mode: 'inline',
            width: '100%',
            height: '100%',
            headerEnabled: false,
            showAvatar: false,
          },
          styleTokens: {
            fontFamily: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", system-ui, sans-serif',
            fontSize: '12px',
            containerBackground: '#0b0b0b',
            chatBorderRadius: '0',
            messageBlockBorderRadius: '6px',
            messageBlockFontSize: '12px',
            messageBlockLineHeight: '1.6',
            messageBlockBackgroundColor: '#0b0b0b',
            messageBlockOutboundBackgroundColor: '#161616',
            messageBlockOutboundTextColor: '#f0ece6',
            messageBlockOutboundBorder: '1px solid #252525',
            messageBlockOutboundBorderRadius: '8px',
            messageBlockInboundBackgroundColor: '#0b0b0b',
            messageBlockInboundTextColor: '#c8c2ba',
            messageBlockInboundBorder: 'none',
            messageBlockPaddingContainer: '0 16px',
            messageBlockContainerMarginTop: '8px',
            avatarDisplay: 'none',
            hideMessageActions: 'none',
            hideCopyAction: 'none',
            messageInputPadding: '10px 16px',
            messageInputBorderRadius: '8px',
            messageInputFontSize: '12px',
            messageInputTextBackgroundColor: '#161616',
            messageInputTextColor: '#f0ece6',
            messageInputFooterBorderColor: '#252525',
            messageInputFooterBorderFocusColor: '#c9a96e',
            messageInputFocusShadow: 'none',
            messageInputFooterPlaceholderText: '#4a4540',
            messageInputPlaceholderFontWeight: '400',
            messageInputSendButtonIconColor: '#c9a96e',
            messageInputFooterSendButton: '#c9a96e',
            messageInputFooterSendButtonHoverColor: '#f0ece6',
            messageInputSendButtonDisabledColor: '#2e2e2e',
            errorBlockBackground: '#1a0808',
          },
        },
      });
    } catch (e) {
      console.error('Agentforce ACC init error:', e);
    }
  }, []);

  const agent = AGENTS.find(a => a.id === selectedAgent)!;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 40,
          background: 'rgba(0,0,0,0.45)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'all' : 'none',
          transition: 'opacity 0.22s ease',
        }}
      />

      {/* Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 400,
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          background: '#0b0b0b',
          borderLeft: '1px solid #252525',
          boxShadow: '-12px 0 48px rgba(0,0,0,0.7)',
          transform: open ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.26s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Drawer header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            height: 56,
            borderBottom: '1px solid #1e1e1e',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#c9a96e', boxShadow: '0 0 8px #c9a96e99', flexShrink: 0,
            }} />
            <span style={{ fontSize: 13, fontWeight: 500, color: '#f0ece6', letterSpacing: '-0.01em' }}>
              Pipeline Assistant
            </span>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close chat"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 28, height: 28, borderRadius: 6,
              border: '1px solid #252525', background: 'none',
              color: '#6b6560', cursor: 'pointer',
              transition: 'color 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.color = '#f0ece6';
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#3a3a3a';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.color = '#6b6560';
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#252525';
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* ACC container — always rendered with real dimensions */}
        <div ref={containerRef} style={{ flex: 1, overflow: 'hidden', minHeight: 0 }} />

        {/* Footer — agent selector sits visually below the ACC input bar */}
        <div
          style={{
            flexShrink: 0,
            padding: '8px 14px',
            borderTop: '1px solid #1a1a1a',
            background: '#0b0b0b',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
          onClick={stopProp}
        >
          <span style={{ fontSize: 11, color: '#3a3a3a', letterSpacing: '0.04em' }}>Agent:</span>

          <div ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setDropdownOpen(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '5px 10px', borderRadius: 7,
                border: `1px solid ${dropdownOpen ? '#3a3a3a' : '#252525'}`,
                background: '#111',
                cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
            >
              <span style={{
                width: 6, height: 6, borderRadius: '50%',
                background: agent.color,
                boxShadow: `0 0 5px ${agent.color}88`,
                flexShrink: 0,
                transition: 'background 0.2s',
              }} />
              <span style={{ fontSize: 12, fontWeight: 500, color: '#f0ece6', letterSpacing: '-0.01em' }}>
                {agent.label}
              </span>
              <span style={{ fontSize: 10, color: '#4a4540', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {agent.tag}
              </span>
              <ChevronDown
                size={11}
                color="#4a4540"
                style={{
                  transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.15s ease',
                }}
              />
            </button>

            {/* Dropdown — opens upward */}
            {dropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 6px)',
                  left: 0,
                  minWidth: 210,
                  background: '#111',
                  border: '1px solid #252525',
                  borderRadius: 8,
                  boxShadow: '0 -8px 32px rgba(0,0,0,0.6)',
                  zIndex: 100,
                  padding: '4px',
                }}
              >
                {AGENTS.map(a => (
                  <button
                    key={a.id}
                    onClick={() => { setSelectedAgent(a.id); setDropdownOpen(false); }}
                    style={{
                      width: '100%',
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 12px', borderRadius: 6,
                      border: 'none',
                      background: selectedAgent === a.id ? '#1a1a1a' : 'none',
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => {
                      if (selectedAgent !== a.id)
                        (e.currentTarget as HTMLButtonElement).style.background = '#161616';
                    }}
                    onMouseLeave={e => {
                      if (selectedAgent !== a.id)
                        (e.currentTarget as HTMLButtonElement).style.background = 'none';
                    }}
                  >
                    <span style={{
                      width: 7, height: 7, borderRadius: '50%',
                      background: a.color, flexShrink: 0,
                      boxShadow: selectedAgent === a.id ? `0 0 6px ${a.color}88` : 'none',
                    }} />
                    <span style={{ flex: 1 }}>
                      <span style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#f0ece6', letterSpacing: '-0.01em' }}>
                        {a.label}
                      </span>
                      <span style={{ display: 'block', fontSize: 10, color: '#4a4540', letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: 1 }}>
                        {a.tag}
                      </span>
                    </span>
                    {selectedAgent === a.id && <Check size={12} color={a.color} strokeWidth={2.5} />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FAB trigger */}
      <button
        onClick={() => setOpen(prev => !prev)}
        aria-label={open ? 'Close Pipeline Assistant' : 'Open Pipeline Assistant'}
        style={{
          position: 'fixed',
          bottom: 28,
          right: 28,
          zIndex: 60,
          width: 48,
          height: 48,
          borderRadius: '50%',
          border: 'none',
          background: open ? '#1e1e1e' : '#c9a96e',
          color: open ? '#6b6560' : '#0b0b0b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: open
            ? '0 2px 12px rgba(0,0,0,0.5)'
            : '0 4px 20px rgba(201,169,110,0.35)',
          transition: 'background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.08)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
      >
        <MessageSquare size={20} strokeWidth={1.75} />
      </button>
    </>
  );
}
