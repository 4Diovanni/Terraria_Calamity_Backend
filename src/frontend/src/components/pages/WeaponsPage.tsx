import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWeapons } from "../../hooks/useWeapons";
import { Loading } from "../ui/Loading";
import { Error } from "../ui/Error";
import { Weapon } from "../../types/weapon";

const WEAPON_CLASSES = ["MELEE", "RANGED", "MAGE", "SUMMON", "ROGUE"];
const RARITIES = ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"];
const ELEMENT = [
  "NEUTRAL",
  "FIRE",
  "ICE",
  "LIGHTNING",
  "EARTH",
  "WATER",
  "WIND",
  "NATURE",
  "HOLY",
  "BRIMSTONE",
  "HOLY_FLAMES",
  "SHADOWFLAME",
  "ASTRAL",
  "PLAGUE",
  "GOD_SLAYER",
  "SULPHURIC",
  "SHADOW",
  "BLOOD",
  "CRYSTAL",
  "ARCANE",
  "ELEMENTAL",
  "COSMIC",
  "TEMPORAL",
  "ABYSSAL",
  "TOXIC",
  "OMNI",
  "MAGIC",
];

export const WeaponsPage = () => {
  const navigate = useNavigate();
  const { weapons, loading, error, refetch } = useWeapons();

  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedRarity, setSelectedRarity] = useState<string>("");
  const [selectedElement, setSelectedElement] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<"name" | "damage">("name");

  // Filtrar armas
  const filteredWeapons = weapons
    .filter((weapon) => {
      if (selectedClass && weapon.weaponClass !== selectedClass) return false;
      if (selectedRarity && weapon.rarity !== selectedRarity) return false;
      if (selectedElement && weapon.element !== selectedElement) return false;
      if (
        searchTerm &&
        !weapon.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
        return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      return b.baseDamage - a.baseDamage;
    });

  const getWeaponClassColor = (weaponClass: string) => {
    switch (weaponClass) {
      case "MELEE":
        return {
          bg: "bg-red-600",
          light: "bg-red-600/20",
          text: "text-red-400",
        };
      case "RANGED":
        return {
          bg: "bg-cyan-600",
          light: "bg-cyan-600/20",
          text: "text-cyan-400",
        };
      case "MAGE":
        return {
          bg: "bg-blue-600",
          light: "bg-blue-600/20",
          text: "text-blue-400",
        };
      case "SUMMON":
        return {
          bg: "bg-yellow-600",
          light: "bg-yellow-600/20",
          text: "text-yellow-400",
        };
      case "ROGUE":
        return {
          bg: "bg-green-600",
          light: "bg-green-600/20",
          text: "text-green-400",
        };
      default:
        return {
          bg: "bg-gray-600",
          light: "bg-gray-600/20",
          text: "text-gray-400",
        };
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "LEGENDARY":
        return {
          light: "bg-yellow-400/20",
          text: "text-yellow-400",
          dark: "from-yellow-600 to-yellow-700",
        };
      case "EPIC":
        return {
          light: "bg-purple-400/20",
          text: "text-purple-400",
          dark: "from-purple-600 to-purple-700",
        };
      case "RARE":
        return {
          light: "bg-blue-400/20",
          text: "text-blue-400",
          dark: "from-blue-600 to-blue-700",
        };
      case "UNCOMMON":
        return {
          light: "bg-green-400/20",
          text: "text-green-400",
          dark: "from-green-600 to-green-700",
        };
      default:
        return {
          light: "bg-gray-400/20",
          text: "text-gray-400",
          dark: "from-gray-600 to-gray-700",
        };
    }
  };

  const getElementColor = (element: string) => {
    switch (element) {
      case "NEUTRAL":
        return {
          bg: "bg-gray-600",
          light: "bg-gray-600/20",
          text: "text-gray-400",
        };
      case "FIRE":
        return {
          bg: "bg-red-600",
          light: "bg-red-600/20",
          text: "text-red-400",
        };
      case "ICE":
        return {
          bg: "bg-blue-400",
          light: "bg-blue-400/20",
          text: "text-blue-400",
        };
      case "LIGHTNING":
        return {
          bg: "bg-yellow-500",
          light: "bg-yellow-500/20",
          text: "text-yellow-400",
        };
      case "EARTH":
        return {
          bg: "bg-amber-700",
          light: "bg-amber-700/20",
          text: "text-amber-400",
        };
      case "WATER":
        return {
          bg: "bg-blue-600",
          light: "bg-blue-600/20",
          text: "text-blue-400",
        };
      case "WIND":
        return {
          bg: "bg-sky-400",
          light: "bg-sky-400/20",
          text: "text-sky-400",
        };
      case "NATURE":
        return {
          bg: "bg-green-600",
          light: "bg-green-600/20",
          text: "text-green-400",
        };
      case "HOLY":
        return {
          bg: "bg-yellow-400",
          light: "bg-yellow-400/20",
          text: "text-yellow-400",
        };
      case "BRIMSTONE":
        return {
          bg: "bg-red-700",
          light: "bg-red-700/20",
          text: "text-red-400",
        };
      case "HOLY_FLAMES":
        return {
          bg: "bg-yellow-400",
          light: "bg-yellow-400/20",
          text: "text-yellow-400",
        };
      case "SHADOWFLAME":
        return {
          bg: "bg-slate-700",
          light: "bg-slate-700/20",
          text: "text-slate-400",
        };
      case "ASTRAL":
        return {
          bg: "bg-purple-600",
          light: "bg-purple-600/20",
          text: "text-purple-400",
        };
      case "PLAGUE":
        return {
          bg: "bg-lime-500",
          light: "bg-lime-500/20",
          text: "text-lime-400",
        };
      case "GOD_SLAYER":
        return {
          bg: "bg-red-800",
          light: "bg-red-800/20",
          text: "text-red-400",
        };
      case "SULPHURIC":
        return {
          bg: "bg-green-400",
          light: "bg-green-400/20",
          text: "text-green-400",
        };
      case "SHADOW":
        return {
          bg: "bg-gray-800",
          light: "bg-gray-800/20",
          text: "text-gray-400",
        };
      case "BLOOD":
        return {
          bg: "bg-red-900",
          light: "bg-red-900/20",
          text: "text-red-400",
        };
      case "CRYSTAL":
        return {
          bg: "bg-cyan-500",
          light: "bg-cyan-500/20",
          text: "text-cyan-400",
        };
      case "ARCANE":
        return {
          bg: "bg-purple-500",
          light: "bg-purple-500/20",
          text: "text-purple-400",
        };
      case "ELEMENTAL":
        return {
          bg: "bg-pink-500",
          light: "bg-pink-500/20",
          text: "text-pink-400",
        };
      case "COSMIC":
        return {
          bg: "bg-blue-700",
          light: "bg-blue-700/20",
          text: "text-blue-400",
        };
      case "TEMPORAL":
        return {
          bg: "bg-sky-500",
          light: "bg-sky-500/20",
          text: "text-sky-400",
        };
      case "ABYSSAL":
        return {
          bg: "bg-indigo-900",
          light: "bg-indigo-900/20",
          text: "text-indigo-400",
        };
      case "TOXIC":
        return {
          bg: "bg-lime-400",
          light: "bg-lime-400/20",
          text: "text-lime-400",
        };
      case "OMNI":
        return {
          bg: "bg-pink-600",
          light: "bg-pink-600/20",
          text: "text-pink-400",
        };
      case "MAGIC":
        return {
          bg: "bg-purple-600",
          light: "bg-purple-600/20",
          text: "text-purple-400",
        };
      default:
        return {
          bg: "bg-gray-600",
          light: "bg-gray-600/20",
          text: "text-gray-400",
        };
    }
  };

  if (loading) {
    return <Loading message="Carregando armas do Calamity..." />;
  }

  if (error) {
    return (
      <Error message={`Erro ao carregar armas: ${error}`} onRetry={refetch} />
    );
  }

  return (
    <div className="min-h-screen bg-calamity-bg-dark text-calamity-text-primary pb-16">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-6xl font-bold font-display text-calamity-accent-gold mb-4">
            ⚔️ Armas
          </h1>
          <p className="text-xl text-calamity-text-secondary">
            Total:{" "}
            <span className="text-calamity-primary font-bold">
              {filteredWeapons.length}
            </span>{" "}
            armas encontradas
          </p>
        </div>

        {/* Filtros */}
        <div className="bg-calamity-bg-secondary border-2 border-calamity-border p-8 mb-12 shadow-mystical">
          <h2 className="text-2xl font-bold font-display text-calamity-accent-gold mb-6">
            Filtros
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Busca */}
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

            {/* Classe */}
            <div>
              <label className="block text-sm font-display text-calamity-text-secondary mb-2">
                Classe
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full bg-calamity-bg-tertiary border-b-2 border-calamity-border text-calamity-text-primary focus:outline-none focus:border-calamity-primary transition-colors duration-300 px-3 py-2 appearance-none cursor-pointer"
              >
                <option value="">Todas as Classes</option>
                {WEAPON_CLASSES.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>

            {/* Raridade */}
            <div>
              <label className="block text-sm font-display text-calamity-text-secondary mb-2">
                Raridade
              </label>
              <select
                value={selectedRarity}
                onChange={(e) => setSelectedRarity(e.target.value)}
                className="w-full bg-calamity-bg-tertiary border-b-2 border-calamity-border text-calamity-text-primary focus:outline-none focus:border-calamity-primary transition-colors duration-300 px-3 py-2 appearance-none cursor-pointer"
              >
                <option value="">Todas as Raridades</option>
                {RARITIES.map((rarity) => (
                  <option key={rarity} value={rarity}>
                    {rarity}
                  </option>
                ))}
              </select>
            </div>

            {/* Elemento */}
            <div>
              <label className="block text-sm font-display text-calamity-text-secondary mb-2">
                Elemento
              </label>
              <select
                value={selectedElement}
                onChange={(e) => setSelectedElement(e.target.value)}
                className="w-full bg-calamity-bg-tertiary border-b-2 border-calamity-border text-calamity-text-primary focus:outline-none focus:border-calamity-primary transition-colors duration-300 px-3 py-2 appearance-none cursor-pointer"
              >
                <option value="">Todos os Elementos</option>
                {ELEMENT.map((element) => (
                  <option key={element} value={element}>
                    {element}
                  </option>
                ))}
              </select>
            </div>

            {/* Ordenar */}
            <div>
              <label className="block text-sm font-display text-calamity-text-secondary mb-2">
                Ordenar por
              </label>
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
        </div>

        {/* Lista de Armas */}
        {filteredWeapons.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-2xl text-calamity-text-secondary font-display">
              Nenhuma arma encontrada
            </p>
            <p className="text-calamity-text-tertiary mt-2">
              Tente ajustar os filtros
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredWeapons.map((weapon: Weapon) => (
              <button
                key={weapon.id}
                onClick={() => navigate(`/weapons/${weapon.id}`)}
                className="w-full group bg-calamity-bg-secondary border-2 border-calamity-border p-6 shadow-mystical hover:shadow-mystical-lg hover:border-calamity-primary transition-all duration-300 hover:-translate-x-2 flex items-center gap-6 text-left"
              >
                {/* Ícone de Imagem */}
                <div
                  className={`flex-shrink-0 w-16 h-16 rounded-lg ${
                    getWeaponClassColor(weapon.weaponClass).bg
                  } flex items-center justify-center text-2xl font-bold text-white`}
                >
                  {weapon.imageUrl ? (
                    <img
                      src={weapon.imageUrl}
                      alt={weapon.name}
                      className="w-12 h-12 object-contain"
                    />
                  ) : (
                    weapon.weaponClass.charAt(0)
                  )}
                </div>

                {/* Informações */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-2xl font-bold font-display text-calamity-accent-gold group-hover:text-calamity-primary transition-colors duration-300 truncate">
                    {weapon.name}
                  </h3>
                  <p className="text-calamity-text-secondary mt-1 line-clamp-2">
                    {weapon.description}
                  </p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    <span
                      className={`px-3 py-1 rounded text-xs font-display uppercase ${
                        getRarityColor(weapon.rarity).light
                      } ${getRarityColor(weapon.rarity).text}`}
                    >
                      {weapon.rarity}
                    </span>
                    <span
                      className={`px-3 py-1 rounded text-xs font-display uppercase ${
                        getElementColor(weapon.element).light
                      } ${getElementColor(weapon.element).text}`}
                    >
                      {weapon.element}
                    </span>
                    <span
                      className={`px-3 py-1 rounded text-xs font-display uppercase ${
                        getWeaponClassColor(weapon.weaponClass).light
                      } ${getWeaponClassColor(weapon.weaponClass).text}`}
                    >
                      {weapon.weaponClass}
                    </span>
                  </div>
                </div>

                {/* Dano */}
                <div className="flex-shrink-0 text-right">
                  <div className="text-3xl font-bold text-calamity-accent-gold font-display">
                    {weapon.baseDamage}
                  </div>
                  <p className="text-xs text-calamity-text-tertiary font-display">
                    DANO
                  </p>
                </div>

                {/* Seta */}
                <div className="flex-shrink-0 text-calamity-primary group-hover:translate-x-2 transition-transform duration-300">
                  →
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
