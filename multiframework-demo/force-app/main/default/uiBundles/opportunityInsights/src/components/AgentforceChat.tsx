import { useEffect, useRef, useState } from 'react';
import { embedAgentforceClient } from '@salesforce/agentforce-conversation-client';
import { ChevronDown, MessageSquare } from 'lucide-react';

// Replace with the 18-digit ID from Setup → Agent Studio → Pipeline & Customer Health Agent URL
const AGENT_ID = '0XxV90000001ZTZKA2';
// Derive from the current page when running inside Salesforce; fall back for local dev
const ORG_ORIGIN = window.location.origin;

const MODELS = [
  { id: 'claude', label: 'Claude Sonnet' },
  { id: 'gpt4o', label: 'GPT-4o' },
  { id: 'gemini', label: 'Gemini 1.5 Pro' },
];

export function BottomChatBar() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);
  const [open, setOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const [modelOpen, setModelOpen] = useState(false);

  useEffect(() => {
    if (mounted.current || !containerRef.current) return;
    mounted.current = true;

    try {
      embedAgentforceClient({
        container: containerRef.current,
        salesforceOrigin: ORG_ORIGIN,
        agentforceClientConfig: {
          agentId: AGENT_ID,
          agentLabel: 'Pipeline Assistant',
          renderingConfig: {
            mode: 'inline',
            width: '100%',
            height: '100%',
            headerEnabled: true,
            showAvatar: false,
          },
          styleTokens: {
            // Container
            containerBackground: '#0f0f0f',
            chatBorderRadius: '0',
            // Header
            headerBlockBackground: '#0f0f0f',
            headerBlockTextColor: '#f0ece6',
            headerBlockFontSize: '13px',
            headerBlockFontWeight: '500',
            headerBlockBorderBottomWidth: '1px',
            headerBlockBorderBottomStyle: 'solid',
            headerBlockBorderBottomColor: '#252525',
            headerBlockBorderRadius: '0',
            headerBlockHoverBackground: '#1a1a1a',
            headerBlockActiveBackground: '#1a1a1a',
            headerBlockIconColor: '#c9a96e',
            // Messages
            messageBlockBorderRadius: '6px',
            messageBlockFontSize: '13px',
            messageBlockLineHeight: '1.55',
            messageBlockBackgroundColor: '#1a1a1a',
            messageBlockOutboundBackgroundColor: '#1a1a1a',
            messageBlockOutboundTextColor: '#f0ece6',
            messageBlockOutboundBorder: '1px solid #2e2e2e',
            messageBlockInboundBackgroundColor: '#252525',
            messageBlockInboundTextColor: '#f0ece6',
            messageBlockInboundBorder: '1px solid #2e2e2e',
            // Input
            messageInputBorderRadius: '6px',
            messageInputFontSize: '13px',
            messageInputTextBackgroundColor: '#1a1a1a',
            messageInputTextColor: '#f0ece6',
            messageInputFooterBorderColor: '#252525',
            messageInputFooterBorderFocusColor: '#c9a96e',
            messageInputFocusShadow: 'none',
            messageInputFooterPlaceholderText: '#6b6560',
            messageInputPlaceholderFontWeight: '400',
            messageInputSendButtonIconColor: '#c9a96e',
            messageInputFooterSendButton: '#c9a96e',
            messageInputFooterSendButtonHoverColor: '#f0ece6',
            messageInputSendButtonDisabledColor: '#3a3a3a',
            // Error
            errorBlockBackground: '#1a0808',
          },
        },
      });
    } catch (e) {
      console.error('Agentforce ACC init error:', e);
    }
  }, []);

  const currentModel = MODELS.find(m => m.id === selectedModel) ?? MODELS[0];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        borderTop: '1px solid #252525',
        background: '#0f0f0f',
        boxShadow: '0 -8px 40px rgba(0,0,0,0.6)',
      }}
    >
      {/*
        ACC panel: position:absolute above the bar so it never collapses the
        container. The iframe always has real dimensions (320×full-width) so
        Lightning Out can fire ready. opacity+pointer-events hide it visually
        when closed — never use height:0 or display:none on the iframe wrapper.
      */}
      <div
        style={{
          position: 'absolute',
          bottom: 56,
          left: 0,
          right: 0,
          height: 320,
          overflow: 'hidden',
          borderTop: '1px solid #252525',
          borderBottom: '1px solid #252525',
          background: '#0f0f0f',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'all' : 'none',
          transform: open ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.18s ease, transform 0.18s ease',
        }}
      >
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Bar */}
      <div
        style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          padding: '0 16px',
          gap: 12,
        }}
      >
        {/* Status dot + label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#c9a96e',
              display: 'inline-block',
              boxShadow: '0 0 6px #c9a96e88',
            }}
          />
          <span style={{ fontSize: 13, fontWeight: 500, color: '#f0ece6', whiteSpace: 'nowrap' }}>
            Pipeline Assistant
          </span>
        </div>

        {/* Model selector */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => setModelOpen(prev => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '4px 10px',
              borderRadius: 20,
              border: '1px solid #2e2e2e',
              background: '#1a1a1a',
              color: '#9b9590',
              fontSize: 11,
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {currentModel.label}
            <ChevronDown size={10} />
          </button>
          {modelOpen && (
            <div
              style={{
                position: 'absolute',
                bottom: 36,
                left: 0,
                background: '#1a1a1a',
                border: '1px solid #2e2e2e',
                borderRadius: 8,
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                zIndex: 60,
                minWidth: 140,
              }}
            >
              {MODELS.map(m => (
                <button
                  key={m.id}
                  onClick={() => { setSelectedModel(m.id); setModelOpen(false); }}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 14px',
                    fontSize: 12,
                    color: m.id === selectedModel ? '#c9a96e' : '#9b9590',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Toggle button */}
        <button
          onClick={() => setOpen(prev => !prev)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            padding: '7px 14px',
            borderRadius: 6,
            border: '1px solid #2e2e2e',
            background: open ? '#1e1e1e' : '#c9a96e',
            color: open ? '#9b9590' : '#0b0b0b',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          }}
          aria-label={open ? 'Collapse chat' : 'Open Pipeline Assistant'}
        >
          {open ? (
            <>
              <ChevronDown size={13} />
              Collapse
            </>
          ) : (
            <>
              <MessageSquare size={13} />
              Ask Pipeline AI
            </>
          )}
        </button>
      </div>
    </div>
  );
}
