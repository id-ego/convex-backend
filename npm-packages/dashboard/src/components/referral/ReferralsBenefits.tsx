import { CheckCircledIcon } from "@radix-ui/react-icons";

export function ReferralsBenefits() {
  return (
    <>
      <Benefit>
        <strong>
          +85,000&nbsp;tokens <small>/ month</small>
        </strong>{" "}
        Chef tokens
      </Benefit>
      <Benefit>
        <strong>
          +1M <small>/ month</small>
        </strong>{" "}
        function calls
      </Benefit>
      <Benefit>
        <strong>
          +20&nbsp;GB-hours <small>/ month</small>
        </strong>{" "}
        action compute
      </Benefit>
      <Benefit>
        <strong>+0.5&nbsp;GB</strong> database storage
      </Benefit>
      <Benefit>
        <strong>
          +1&nbsp;GB <small>/ month</small>
        </strong>{" "}
        database bandwidth
      </Benefit>
      <Benefit>
        <strong>+1&nbsp;GB</strong> file storage
      </Benefit>
      <Benefit>
        <strong>
          +1&nbsp;GB <small>/ month</small>
        </strong>{" "}
        file bandwidth
      </Benefit>
    </>
  );
}

function Benefit({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex gap-2 text-sm leading-snug">
      <CheckCircledIcon className="size-5 text-green-700 dark:text-green-400" />
      <div className="flex flex-col text-content-secondary [&>strong]:font-medium [&>strong]:text-content-primary">
        {children}
      </div>
    </li>
  );
}
