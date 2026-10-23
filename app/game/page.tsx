import AlphabetGamePage from "@/games/alphabet/page";
import { DEFAULT_LOCALE } from "@/shared/domain/locale";

export default function GamePage() {
  return <AlphabetGamePage locale={DEFAULT_LOCALE} />;
}
