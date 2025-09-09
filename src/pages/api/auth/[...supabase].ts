import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { NextApiRequest, NextApiResponse } from "next";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    // Этот эндпоинт обрабатывает коллбэк от GitHub после успешного логина

    // 1. Создаем серверный клиент Supabase
    const supabase = createServerSupabaseClient({ req, res });

    // 2. Получаем временный 'code' из параметров запроса
    const { code } = req.query;

    // 3. Если код есть, обмениваем его на сессию пользователя
    if (typeof code === "string") {
        await supabase.auth.exchangeCodeForSession(code);
    }

    // 4. Перенаправляем пользователя обратно на главную страницу
    res.redirect("/");
};

export default handler;
