import { http, HttpResponse, delay } from "msw";
import { demoUser, generateToken, validateToken } from "../data/users";

const TOKEN_PREFIX = "pkh_mock_";

export const authHandlers = [
  http.post("/api/auth/login", async ({ request }) => {
    await delay(600);
    const body = (await request.json()) as {
      email: string;
      password: string;
    };

    if (
      body.email === "admin@parkhub.test" &&
      body.password === "ParkHub123"
    ) {
      const token = generateToken(demoUser.id);
      return HttpResponse.json({
        data: {
          token,
          user: demoUser,
        },
      });
    }

    return HttpResponse.json(
      {
        code: "INVALID_CREDENTIALS",
        message: "账号或密码错误",
      },
      { status: 401 }
    );
  }),

  http.post("/api/auth/sms/send", async ({ request }) => {
    await delay(300);
    const body = (await request.json()) as { phone: string };
    if (!body.phone) {
      return HttpResponse.json(
        { code: "INVALID_PHONE", message: "请提供手机号" },
        { status: 400 }
      );
    }
    return HttpResponse.json({ data: { success: true } });
  }),

  http.post("/api/auth/sms/login", async ({ request }) => {
    await delay(600);
    const body = (await request.json()) as {
      phone: string;
      code: string;
    };

    if (body.phone === "13800000000" && body.code === "123456") {
      const token = generateToken(demoUser.id);
      return HttpResponse.json({
        data: {
          token,
          user: demoUser,
        },
      });
    }

    return HttpResponse.json(
      {
        code: "INVALID_SMS",
        message: "手机号或验证码错误",
      },
      { status: 401 }
    );
  }),

  http.get("/api/auth/oauth/:provider", async ({ params }) => {
    await delay(300);
    const provider = params.provider as string;
    return HttpResponse.json({
      data: {
        url: `/oauth/${provider}?code=mock_${provider}_code`,
        provider,
      },
    });
  }),

  http.post("/api/auth/oauth/:provider/callback", async ({ params }) => {
    await delay(600);
    const provider = params.provider as string;
    const token = generateToken(demoUser.id);
    return HttpResponse.json({
      data: {
        token: `${TOKEN_PREFIX}${provider}_${token}`,
        user: { ...demoUser, name: `${provider} 用户` },
      },
    });
  }),

  http.get("/api/auth/me", async ({ request }) => {
    await delay(200);
    const auth = request.headers.get("Authorization");
    if (!auth || !auth.startsWith("Bearer ")) {
      return HttpResponse.json(
        { code: "UNAUTHORIZED", message: "未登录" },
        { status: 401 }
      );
    }

    const token = auth.slice(7);
    if (validateToken(token)) {
      return HttpResponse.json({ data: demoUser });
    }

    return HttpResponse.json(
      { code: "TOKEN_EXPIRED", message: "登录已过期" },
      { status: 401 }
    );
  }),

  http.post("/api/auth/logout", async () => {
    await delay(200);
    return HttpResponse.json({ data: { success: true } });
  }),
];
