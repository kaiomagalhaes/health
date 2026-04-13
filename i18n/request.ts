import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  return {
    locale: "pt-BR",
    timeZone: "America/Sao_Paulo",
    messages: (await import("./messages/pt-BR.json")).default,
  };
});
