import React, { useState, useMemo } from 'react';
import { useHapticsAudio } from './hooks/useHapticsAudio';
import { useBluetooth } from './hooks/useBluetooth';
import { useControls } from './hooks/useControls';
import { useTheme } from './hooks/useTheme';

// Page Components
import { HomePage } from './components/HomePage';
import { Navigation } from './components/Navigation';
import { Header } from './components/Header';
import { ConnectionCard } from './components/ConnectionCard';
import { TelemetryDeck } from './components/TelemetryDeck';
import { LayoutToggle } from './components/LayoutToggle';
import { TouchDeckSplit } from './components/TouchDeckSplit';
import { TouchDeckDpad } from './components/TouchDeckDpad';
import { SettingsCard } from './components/SettingsCard';
import { TeamPage } from './components/TeamPage';

// Resources Components
import { ResourcesHeader } from './components/ResourcesHeader';
import { ResourceFilters } from './components/ResourceFilters';
import { ResourceCard } from './components/ResourceCard';
import { ResourceEmptyState } from './components/ResourceEmptyState';
import { ProjectDocCTA } from './components/ProjectDocCTA';
import { ResourceViewerModal } from './components/ResourceViewerModal';

import { RESOURCES_DATA } from './data/resourcesData';

export default function App() {
  // Navigation & View State ('home' | 'controller' | 'resources' | 'team')
  const [activeView, setActiveView] = useState('home');
  const [activeLayout, setActiveLayout] = useState('split'); // 'split' | 'dpad'

  // Theme State ('light' | 'dark' | 'system')
  const { themeMode, setThemeMode } = useTheme();

  // Resources State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeModalResource, setActiveModalResource] = useState(null);

  const {
    hapticsEnabled,
    setHapticsEnabled,
    audioEnabled,
    setAudioEnabled,
    playClickSound,
    triggerHaptic
  } = useHapticsAudio();

  const {
    connectionMode,
    setConnectionMode,
    isConnected,
    deviceLabel,
    bridgeHost,
    setBridgeHost,
    heartbeatTick,
    sendSerialChar,
    connectWebBluetoothOrSerial,
    connectBridgeServer,
    disconnect,
    currentThrottleRef,
    currentSteeringRef
  } = useBluetooth();

  const {
    activeKeys,
    throttleState,
    steeringState,
    handleControlPress,
    handleControlRelease,
    triggerEmergencyStop
  } = useControls({
    sendSerialChar,
    currentThrottleRef,
    currentSteeringRef,
    triggerHaptic,
    playClickSound,
    activeView
  });

  // Filter Resources List
  const filteredResources = useMemo(() => {
    return RESOURCES_DATA.filter((res) => {
      const matchesCategory =
        selectedCategory === 'All' || res.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        res.title.toLowerCase().includes(q) ||
        res.description.toLowerCase().includes(q) ||
        res.tag.toLowerCase().includes(q) ||
        res.type.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
  };

  const handleViewDocumentationClick = () => {
    setSelectedCategory('Documentation');
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`app-container ${activeView === 'home' ? 'view-home-no-scroll' : ''}`}>
      {/* Top View Router Navigation */}
      <Navigation
        activeView={activeView}
        setActiveView={setActiveView}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {activeView === 'home' ? (
          /* ===================================================================
             VIEW 0: HOME LANDING PAGE
             =================================================================== */
          <HomePage
            onEnter={() => setActiveView('controller')}
            onExploreDocs={() => {
              setSelectedCategory('All');
              setActiveView('resources');
            }}
          />
        ) : activeView === 'controller' ? (
          /* ===================================================================
             VIEW 1: REMOTE CONTROLLER DECK
             =================================================================== */
          <>
            <Header isConnected={isConnected} deviceLabel={deviceLabel} />

            <div className="controller-dashboard-grid">
              <div className="dashboard-column side-column">
                <ConnectionCard
                  connectionMode={connectionMode}
                  setConnectionMode={setConnectionMode}
                  isConnected={isConnected}
                  onConnectWebBt={connectWebBluetoothOrSerial}
                  onConnectBridge={connectBridgeServer}
                  onDisconnect={disconnect}
                  bridgeHost={bridgeHost}
                  setBridgeHost={setBridgeHost}
                />

                <TelemetryDeck
                  throttleState={throttleState}
                  steeringState={steeringState}
                  heartbeatTick={heartbeatTick}
                />

                <SettingsCard
                  hapticsEnabled={hapticsEnabled}
                  setHapticsEnabled={setHapticsEnabled}
                  audioEnabled={audioEnabled}
                  setAudioEnabled={setAudioEnabled}
                  themeMode={themeMode}
                  setThemeMode={setThemeMode}
                />
              </div>

              <div className="dashboard-column main-controls-column">
                <LayoutToggle
                  activeLayout={activeLayout}
                  setActiveLayout={setActiveLayout}
                />

                {activeLayout === 'split' ? (
                  <TouchDeckSplit
                    activeKeys={activeKeys}
                    onPress={handleControlPress}
                    onRelease={handleControlRelease}
                    onEstop={triggerEmergencyStop}
                  />
                ) : (
                  <TouchDeckDpad
                    activeKeys={activeKeys}
                    onPress={handleControlPress}
                    onRelease={handleControlRelease}
                    onEstop={triggerEmergencyStop}
                  />
                )}
              </div>
            </div>
          </>
        ) : activeView === 'resources' ? (
          /* ===================================================================
             VIEW 2: RESOURCES & TECHNICAL DOCUMENTATION HUB
             =================================================================== */
          <>
            <ResourcesHeader />

            <ResourceFilters
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              totalResults={filteredResources.length}
            />

            {filteredResources.length > 0 ? (
              <div className="resources-grid">
                {filteredResources.map((res) => (
                  <ResourceCard
                    key={res.id}
                    resource={res}
                    onOpenModal={(r) => setActiveModalResource(r)}
                  />
                ))}
              </div>
            ) : (
              <ResourceEmptyState onReset={handleResetFilters} />
            )}

            <ProjectDocCTA
              onViewDocumentation={handleViewDocumentationClick}
            />
          </>
        ) : (
          /* ===================================================================
             VIEW 3: DEVELOPMENT TEAM MEMBERS
             =================================================================== */
          <TeamPage />
        )}
      </main>

      {/* Document & Code Viewer Modal */}
      {activeModalResource && (
        <ResourceViewerModal
          resource={activeModalResource}
          onClose={() => setActiveModalResource(null)}
        />
      )}

      {/* App Footer (Hidden on Home Page) */}
      {activeView !== 'home' && (
        <footer className="app-footer">
          <p>Ruea-Roy RC Platform By SPR41 &bull; React Web & Resources Hub</p>
        </footer>
      )}
    </div>
  );
}
