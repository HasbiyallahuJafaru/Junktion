'use client'

import { Component, ReactNode } from 'react'

interface Props  { children: ReactNode }
interface State  { crashed: boolean }

/** Catches render errors in the menu section so they don't blank the whole page */
export class MenuErrorBoundary extends Component<Props, State> {
  state: State = { crashed: false }

  static getDerivedStateFromError(): State {
    return { crashed: true }
  }

  render() {
    if (this.state.crashed) {
      return (
        <section style={{
          background: '#F5F0EB',
          padding: '80px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
        }}>
          <p style={{ fontFamily: 'sans-serif', color: '#6B6760', fontSize: '0.9rem', margin: 0 }}>
            Couldn&apos;t load the menu right now.
          </p>
          <button
            onClick={() => { this.setState({ crashed: false }) }}
            style={{
              background: '#F15A22', border: 'none', borderRadius: 999,
              color: '#fff', fontFamily: 'sans-serif', fontSize: '0.8rem',
              fontWeight: 700, padding: '10px 24px', cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </section>
      )
    }
    return this.props.children
  }
}
