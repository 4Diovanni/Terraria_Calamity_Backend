import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './components/pages/HomePage';
import { WeaponsPage } from './components/pages/WeaponsPage';
import { WeaponDetailPage } from './components/pages/WeaponDetailPage';
import { EnemiesPage } from './components/pages/EnemiesPage';
import { EnemyDetailPage } from './components/pages/EnemyDetailPage';
import { NPCsPage } from './components/pages/NPCsPage';
import { BiomesPage } from './components/pages/BiomesPage';
import { BiomeDetailPage } from './components/pages/BiomeDetailPage';
import { ItemsPage } from './components/pages/ItemsPage';
import { ArmorPage } from './components/pages/ArmorPage';
import { ArmorDetailPage } from './components/pages/ArmorDetailPage';
import { BossesPage } from './components/pages/BossesPage';
import { BossDetailPage } from './components/pages/BossDetailPage';
import { NotFound } from './components/pages/NotFound';
import { Layout } from './components/common/Layout';
import { LoginPage } from './components/pages/LoginPage';
import { RegisterPage } from './components/pages/RegisterPage';
import { ProfilePage } from './components/pages/ProfilePage';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/*"
            element={
              <Layout>
                <Routes>
                  <Route index element={<HomePage />} />
                  <Route path="weapons" element={<WeaponsPage />} />
                  <Route path="weapons/:id" element={<WeaponDetailPage />} />
                  <Route path="armor" element={<ArmorPage />} />
                  <Route path="armor/:id" element={<ArmorDetailPage />} />
                  <Route path="enemies" element={<EnemiesPage />} />
                  <Route path="enemies/:id" element={<EnemyDetailPage />} />
                  <Route path="bosses" element={<BossesPage />} />
                  <Route path="bosses/:id" element={<BossDetailPage />} />
                  <Route path="npcs" element={<NPCsPage />} />
                  <Route path="biomes" element={<BiomesPage />} />
                  <Route path="biomes/:id" element={<BiomeDetailPage />} />
                  <Route path="items" element={<ItemsPage />} />
                  <Route
                    path="perfil"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
