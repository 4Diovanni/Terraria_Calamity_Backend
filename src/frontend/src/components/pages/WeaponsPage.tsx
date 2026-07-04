import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWeapons } from "../../hooks/useWeapons";
import { useAuth } from "../../hooks/useAuth";
import { Loading } from "../ui/Loading";
import { Error } from "../ui/Error";
import { Drawer } from "../ui/Drawer";
import { Button } from "../ui/Button";
import { WeaponCard } from "./WeaponCard";
import { WeaponForm } from "./WeaponForm";
import { weaponService } from "../../services/weaponService";
import { weaponRarityToTier } from "../../lib/weaponRarity";
import { WeaponFormData } from "../../types/weapon";

const WEAPON_CLASSES = ["MELEE", "RANGED", "MAGE", "SUMMON", "ROGUE"];
const RARITIES = ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"];
const ELEMENT = [
  "NEUTRAL", "FIRE", "ICE", "LIGHTNING", "EARTH", "WATER", "WIND", "NATURE",
  "HOLY", "BRIMSTONE", "HOLY_FLAMES", "SHADOWFLAME", "ASTRAL", "PLAGUE",
  "GOD_SLAYER", "SULPHURIC", "SHADOW", "BLOOD", "CRYSTAL", "ARCANE",
  "ELEMENTAL", "COSMIC", "TEMPORAL", "ABYSSAL", "TOXIC", "OMNI", "MAGIC",
];

export const WeaponsPage = () => {
  const navigate = useNavigate();
  const { weapons, loading, error, wakingUp, retryAttempt, refetch } = useWeapons();
  const { user } = useAuth();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleCreate = async (data: WeaponFormData) => {
    await weaponService.createWeapon(data);
    setIsCreateOpen(false);
    await refetch();
  };

  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedRarity, setSelectedRarity] = useState<string>("");
  const [selectedElement, setSelectedElement] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<"name" | "damage">("name");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFilterCount = [selectedClass, selectedRarity, selectedElement, searchTerm].filter(
    Boolean
  ).length;

  const filteredWeapons = weapons
    .filter((weapon) => {
      if (selectedClass && weapon.weaponClass !== selectedClass) return false;
      if (selectedRarity && weaponRarityToTier(weapon.rarity) !== selectedRarity) return false;
      if (selectedElement && weapon.element !== selectedElement) return false;
      if (searchTerm && !weapon.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => (sortBy === "name" ? a.name.localeCompare(b.name) : b.baseDamage - a.baseDamage));

  if (loading) {
    return (
      <Loading
        message={
          wakingUp
            ? `Acordando o servidor... (tentativa ${retryAttempt?.attempt}/${retryAttempt?.maxRetries})`
            : "Carregando armas do Calamity..."
        }
      />
    );
  }

  if (error) {
    return <Error message={`Erro ao carregar armas: ${error}`} onRetry={refetch} />;
  }

  const filterControls = (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div>
        <label className="block text-sm font-display text-calamity-text-secondary mb-2">
          Buscar por Nome
        </label>
        <input
          type="text"
          placeholder="Digite o nome da arma..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-calamity-bg-tertiary border-b-2 border-calamity-border text-calamity-text-primary placeholder-calamity-text-tertiary focus:outline-none focus:border-calamity-primary transition-colors duration-300 px-3 py-2"
        />
      </div>

      <div>
        <label className="block text-sm font-display text-calamity-text-secondary mb-2">Classe</label>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="w-full bg-calamity-bg-tertiary border-b-2 border-calamity-border text-calamity-text-primary focus:outline-none focus:border-calamity-primary transition-colors duration-300 px-3 py-2 appearance-none cursor-pointer"
        >
          <option value="">Todas as Classes</option>
          {WEAPON_CLASSES.map((cls) => (
            <option key={cls} value={cls}>{cls}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="filter-rarity" className="block text-sm font-display text-calamity-text-secondary mb-2">Raridade</label>
        <select
          id="filter-rarity"
          value={selectedRarity}
          onChange={(e) => setSelectedRarity(e.target.value)}
          className="w-full bg-calamity-bg-tertiary border-b-2 border-calamity-border text-calamity-text-primary focus:outline-none focus:border-calamity-primary transition-colors duration-300 px-3 py-2 appearance-none cursor-pointer"
        >
          <option value="">Todas as Raridades</option>
          {RARITIES.map((rarity) => (
            <option key={rarity} value={rarity}>{rarity}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-display text-calamity-text-secondary mb-2">Elemento</label>
        <select
          value={selectedElement}
          onChange={(e) => setSelectedElement(e.target.value)}
          className="w-full bg-calamity-bg-tertiary border-b-2 border-calamity-border text-calamity-text-primary focus:outline-none focus:border-calamity-primary transition-colors duration-300 px-3 py-2 appearance-none cursor-pointer"
        >
          <option value="">Todos os Elementos</option>
          {ELEMENT.map((element) => (
            <option key={element} value={element}>{element}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-display text-calamity-text-secondary mb-2">Ordenar por</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "name" | "damage")}
          className="w-full bg-calamity-bg-tertiary border-b-2 border-calamity-border text-calamity-text-primary focus:outline-none focus:border-calamity-primary transition-colors duration-300 px-3 py-2 appearance-none cursor-pointer"
        >
          <option value="name">Nome (A-Z)</option>
          <option value="damage">Dano (Maior)</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-calamity-bg-dark text-calamity-text-primary pb-16">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl sm:text-6xl font-bold font-display text-calamity-accent-gold mb-4">
            ⚔️ Armas
          </h1>
          <p className="text-xl text-calamity-text-secondary">
            Total: <span className="text-calamity-primary font-bold">{filteredWeapons.length}</span> armas encontradas
          </p>
          {user?.role === 'ADMIN' && (
            <Button variant="primary" size="sm" className="mt-4" onClick={() => setIsCreateOpen(true)}>
              + Nova Arma
            </Button>
          )}
        </div>

        <div className="md:hidden mb-8">
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="w-full px-4 py-3 bg-calamity-bg-secondary border-2 border-calamity-border text-calamity-text-primary font-display"
          >
            Filtrar{activeFilterCount > 0 ? ` (${activeFilterCount} ativos)` : ""}
          </button>
        </div>

        <div className="hidden md:block bg-calamity-bg-secondary border-2 border-calamity-border p-8 mb-12 shadow-mystical">
          <h2 className="text-2xl font-bold font-display text-calamity-accent-gold mb-6">Filtros</h2>
          {filterControls}
        </div>

        <Drawer open={filtersOpen} onOpenChange={setFiltersOpen} title="Filtros" side="bottom">
          <div className="flex flex-col gap-6">
            {filterControls}
            <button
              type="button"
              onClick={() => setFiltersOpen(false)}
              className="px-6 py-3 bg-calamity-primary hover:bg-calamity-primary-light text-calamity-text-primary font-display"
            >
              Aplicar Filtros
            </button>
          </div>
        </Drawer>

        <Drawer open={isCreateOpen} onOpenChange={setIsCreateOpen} title="Nova Arma" side="right">
          <WeaponForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateOpen(false)}
            submitLabel="Criar Arma"
          />
        </Drawer>

        {filteredWeapons.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-2xl text-calamity-text-secondary font-display">Nenhuma arma encontrada</p>
            <p className="text-calamity-text-tertiary mt-2">Tente ajustar os filtros</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredWeapons.map((weapon) => (
              <WeaponCard key={weapon.id} weapon={weapon} onSelect={(id) => navigate(`/weapons/${id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
