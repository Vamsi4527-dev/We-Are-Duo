export default function Footer() {
  return (
    <footer
      className="
        mt-auto
        border-t
        border-[#d9e2e1] dark:border-[#303c39]
        bg-white dark:bg-[#111817]
        px-4 py-6
        text-center
        transition-colors duration-300">

      <p
        className="
          text-sm
          font-semibold
          text-[#10201f] dark:text-[#FFFFFF]
          transition-colors duration-300">
        We Are Duo
      </p>

      <p
        className="
          mt-1
          text-xs
          text-[#566867] dark:text-[#aab8b5]
          transition-colors duration-300">
        Developed by Vamsi Krishna for my Sita
      </p>

      <p
        className="
          mt-3
          text-xs
          text-[#566867] dark:text-[#aab8b5]
          transition-colors duration-300">
        © 2026 All rights reserved
      </p>
      
    </footer>
  );
}
