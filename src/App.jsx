import React, { useState, useMemo } from 'react';
import { useHapticsAudio } from './hooks/useHapticsAudio';
import { useBluetooth } from './hooks/useBluetooth';
import { useControls } from './hooks/useControls';

// Controller Components
import { Navigation } from './components/Navigation';
import { Header } from './components/Header';
import { ConnectionCard } from './components/ConnectionCard';
import { TelemetryDeck } from './components/TelemetryDeck';
import { LayoutToggle } from './components/LayoutToggle';
import { TouchDeckSplit } from './components/TouchDeckSplit';
import { TouchDeckDpad } from './components/TouchDeckDpad';
import { SettingsCard } from './components/SettingsCard';

// Resources Components
import { ResourcesHeader } from './components/ResourcesHeader';
import { ResourceFilters } from './components/ResourceFilters';
import { ResourceCard } from './components/ResourceCard';
import { ResourceEmptyState } from './components/ResourceEmptyState';
import { ProjectDocCTA } from './components/ProjectDocCTA';
import { ResourceViewerModal } from './components/ResourceViewerModal';

import { RESOURCES_DATA } from './data/resourcesData';

export default function App() {
  // Navigation & View State ('controller' | 'resources')
  const [activeView, setActiveView] = useState('controller');
  const [activeLayout, setActiveLayout] = useState('split'); // 'split' | 'dpad'

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
    playClickSound
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
    <div class="app-container">
      {/* Top View Router Navigation */}
      <Navigation activeView={activeView} setActiveView={setActiveView} />

      {/* Main Content Area */}
      <main class="main-content">
        {activeView === 'controller' ? (
          /* ===================================================================
             VIEW 1: REMOTE CONTROLLER DECK
             =================================================================== */
          <>
            <Header isConnected={isConnected} deviceLabel={deviceLabel} />

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

            <SettingsCard
              hapticsEnabled={hapticsEnabled}
              setHapticsEnabled={setHapticsEnabled}
              audioEnabled={audioEnabled}
              setAudioEnabled={setAudioEnabled}
            />
          </>
        ) : (
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
              <div class="resources-grid">
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
        )}
      </main>

      {/* Document & Code Viewer Modal */}
      {activeModalResource && (
        <ResourceViewerModal
          resource={activeModalResource}
          onClose={() => setActiveModalResource(null)}
        />
      )}

      {/* App Footer */}
      <footer class="app-footer">
        <p>Ruea-Roy RC Platform By SPR41 &bull; React Web & Resources Hub</p>
      </footer>
    </div>
  );
}
