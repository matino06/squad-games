import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GameProvider } from "./src/context/GameContext";
import { ImposterProvider } from "./src/context/ImposterContext";
import { AliasProvider } from "./src/context/AliasContext";
import { LanguageProvider } from "./src/context/LanguageContext";
import { SpectrumProvider } from "./src/context/SpectrumContext";
import { PurchaseProvider } from "./src/context/PurchaseContext";
import { IntrigueProvider } from "./src/context/IntrigueContext";

// Shared
import HomeScreen from "./src/screens/HomeScreen";

// Mafija
import SetupScreen from "./src/screens/mafia/SetupScreen";
import RoleAssignmentScreen from "./src/screens/mafia/RoleAssignmentScreen";
import NightPhaseScreen from "./src/screens/mafia/NightPhaseScreen";
import DayPhaseScreen from "./src/screens/mafia/DayPhaseScreen";
import ResultScreen from "./src/screens/mafia/ResultScreen";

// Imposter
import ImposterSetupScreen from "./src/screens/imposter/ImposterSetupScreen";
import ImposterRevealScreen from "./src/screens/imposter/ImposterRevealScreen";
import ImposterPlayScreen from "./src/screens/imposter/ImposterPlayScreen";

// Alias
import AliasSetupScreen from "./src/screens/alias/AliasSetupScreen";
import AliasReadyScreen from "./src/screens/alias/AliasReadyScreen";
import AliasGameScreen from "./src/screens/alias/AliasGameScreen";
import AliasScoreScreen from "./src/screens/alias/AliasScoreScreen";
import AliasFinalScreen from "./src/screens/alias/AliasFinalScreen";

// Spectrum
import SpectrumSetupScreen from "./src/screens/spectrum/SpectrumSetupScreen";
import SpectrumTransitionScreen from "./src/screens/spectrum/SpectrumTransitionScreen";
import SpectrumClueScreen from "./src/screens/spectrum/SpectrumClueScreen";
import SpectrumGuessScreen from "./src/screens/spectrum/SpectrumGuessScreen";
import SpectrumResultScreen from "./src/screens/spectrum/SpectrumResultScreen";
import SpectrumFinalScreen from "./src/screens/spectrum/SpectrumFinalScreen";

// Intrige
import IntrigueSetupScreen from "./src/screens/intrigue/IntrigueSetupScreen";
import IntrigueHandoffScreen from "./src/screens/intrigue/IntrigueHandoffScreen";
import IntrigueTurnScreen from "./src/screens/intrigue/IntrigueTurnScreen";
import IntrigueReactionScreen from "./src/screens/intrigue/IntrigueReactionScreen";
import IntrigueChallengeScreen from "./src/screens/intrigue/IntrigueChallengeScreen";
import IntrigueLoseInfluenceScreen from "./src/screens/intrigue/IntrigueLoseInfluenceScreen";
import IntrigueExchangeScreen from "./src/screens/intrigue/IntrigueExchangeScreen";
import IntrigueVictoryScreen from "./src/screens/intrigue/IntrigueVictoryScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <PurchaseProvider>
          <GameProvider>
            <ImposterProvider>
              <AliasProvider>
                <SpectrumProvider>
                  <IntrigueProvider>
                    <NavigationContainer>
                      <StatusBar style="light" />
                      <Stack.Navigator
                        initialRouteName="Home"
                        screenOptions={{
                          headerShown: false,
                          animation: "fade",
                          contentStyle: { backgroundColor: "#0d0118" },
                        }}
                      >
                        {/* Home */}
                        <Stack.Screen name="Home" component={HomeScreen} />

                        {/* Mafija */}
                        <Stack.Screen name="Setup" component={SetupScreen} />
                        <Stack.Screen
                          name="RoleAssignment"
                          component={RoleAssignmentScreen}
                        />
                        <Stack.Screen
                          name="NightPhase"
                          component={NightPhaseScreen}
                        />
                        <Stack.Screen
                          name="DayPhase"
                          component={DayPhaseScreen}
                        />
                        <Stack.Screen name="Result" component={ResultScreen} />

                        {/* Imposter */}
                        <Stack.Screen
                          name="ImposterSetup"
                          component={ImposterSetupScreen}
                        />
                        <Stack.Screen
                          name="ImposterReveal"
                          component={ImposterRevealScreen}
                        />
                        <Stack.Screen
                          name="ImposterPlay"
                          component={ImposterPlayScreen}
                        />

                        {/* Alias */}
                        <Stack.Screen
                          name="AliasSetup"
                          component={AliasSetupScreen}
                        />
                        <Stack.Screen
                          name="AliasReady"
                          component={AliasReadyScreen}
                        />
                        <Stack.Screen
                          name="AliasGame"
                          component={AliasGameScreen}
                        />
                        <Stack.Screen
                          name="AliasScore"
                          component={AliasScoreScreen}
                        />
                        <Stack.Screen
                          name="AliasFinal"
                          component={AliasFinalScreen}
                        />

                        {/* Spectrum */}
                        <Stack.Screen
                          name="SpectrumSetup"
                          component={SpectrumSetupScreen}
                        />
                        <Stack.Screen
                          name="SpectrumTransition"
                          component={SpectrumTransitionScreen}
                        />
                        <Stack.Screen
                          name="SpectrumClue"
                          component={SpectrumClueScreen}
                        />
                        <Stack.Screen
                          name="SpectrumGuess"
                          component={SpectrumGuessScreen}
                        />
                        <Stack.Screen
                          name="SpectrumResult"
                          component={SpectrumResultScreen}
                        />
                        <Stack.Screen
                          name="SpectrumFinal"
                          component={SpectrumFinalScreen}
                        />

                        {/* Intrige */}
                        <Stack.Screen
                          name="IntrigueSetup"
                          component={IntrigueSetupScreen}
                        />
                        <Stack.Screen
                          name="IntrigueHandoff"
                          component={IntrigueHandoffScreen}
                        />
                        <Stack.Screen
                          name="IntrigueTurn"
                          component={IntrigueTurnScreen}
                        />
                        <Stack.Screen
                          name="IntrigueReaction"
                          component={IntrigueReactionScreen}
                        />
                        <Stack.Screen
                          name="IntrigueChallenge"
                          component={IntrigueChallengeScreen}
                        />
                        <Stack.Screen
                          name="IntrigueLoseInfluence"
                          component={IntrigueLoseInfluenceScreen}
                        />
                        <Stack.Screen
                          name="IntrigueExchange"
                          component={IntrigueExchangeScreen}
                        />
                        <Stack.Screen
                          name="IntrigueVictory"
                          component={IntrigueVictoryScreen}
                        />
                      </Stack.Navigator>
                    </NavigationContainer>
                  </IntrigueProvider>
                </SpectrumProvider>
              </AliasProvider>
            </ImposterProvider>
          </GameProvider>
        </PurchaseProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
