import Script from "next/script";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { Button } from "@ui/Button";

export function AskAI() {
  return (
    <>
      <Script
        src="https://widget.kapa.ai/kapa-widget.bundle.js"
        data-modal-title="Convex AI"
        data-button-hide="true"
        data-modal-override-open-class="js-launch-kapa-ai"
        data-website-id="8dfb3aad-6006-4f56-b2ed-75fa8051db22"
        data-project-name="Convex"
        data-project-color="#3F5295"
        data-project-logo="https://img.stackshare.io/service/41143/default_f1d33b63d360437ba28c8ac981dd68d7d2478b22.png"
        data-user-analytics-fingerprint-enabled="true"
        data-user-analytics-cookie-enabled="true"
        data-search-mode-enabled="true"
        // Additional styles are applied to this modal in globals.css
      />
      <Button
        inline
        className="js-launch-kapa-ai flex items-center gap-1 rounded-full px-2.5 text-sm text-content-primary"
      >
        <SparklesIcon className="size-4" />
        <span className="hidden md:block">Ask AI</span>
      </Button>
    </>
  );
}
