export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-calamity-bg-secondary border-t border-calamity-border mt-16 shadow-mystical">
      <div className="container mx-auto px-4 py-8 text-center text-calamity-text-secondary">
        <p>&copy; {currentYear} Terraria Calamity RPG. Desenvolvido com ❤️ por Giovanni Moreira</p>
        <p className="text-sm mt-2 text-calamity-text-tertiary">
          Feito com Java Spring Boot + React + TypeScript
        </p>
      </div>
    </footer>
  );
};
