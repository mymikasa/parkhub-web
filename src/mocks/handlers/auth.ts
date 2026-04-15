import { http, HttpResponse, delay } from "msw";
import { demoUser, generateToken, validateToken } from "../data/users";
import type { BackendUser } from "@/lib/api/contracts";

const TOKEN_PREFIX = "pkh_mock_";
const ACCESS_EXPIRES_IN_SECONDS = 7 * 24 * 60 * 60;

const backendDemoUser: BackendUser = {
  userId: demoUser.id,
  username: demoUser.email,
  email: demoUser.email,
  phone: demoUser.phone,
  realName: demoUser.name,
  role: demoUser.role,
  status: "active",
};

function createLoginResponse(provider = "mock") {
  const accessToken = generateToken(`${provider}_${backendDemoUser.userId}`);
  const refreshToken = generateToken(`${provider}_refresh_${backendDemoUser.userId}`);

  return {
    accessToken,
    refreshToken,
    accessExpiresIn: ACCESS_EXPIRES_IN_SECONDS,
    tokenType: "Bearer",
    user: backendDemoUser,
  };
}

export const authHandlers = [
  http.post("/identity/v1/auth/login", async ({ request }) => {
    await delay(600);
    const body = (await request.json()) as {
      username: string;
      password: string;
    };

    if (
      (body.username === "admin@parkhub.test" || body.username === "admin") &&
      body.password === "ParkHub123"
    ) {
      return HttpResponse.json(createLoginResponse("password"));
    }

    return HttpResponse.json(
      {
        code: "INVALID_CREDENTIALS",
        message: "账号或密码错误",
      },
      { status: 401 }
    );
  }),

  http.post("/identity/v1/auth/sms/send", async ({ request }) => {
    await delay(300);
    const body = (await request.json()) as { phone: string; purpose?: string };
    if (!body.phone) {
      return HttpResponse.json(
        { code: "INVALID_PHONE", message: "请提供手机号" },
        { status: 400 }
      );
    }
    if (!/^1[3-9]\d{9}$/.test(body.phone)) {
      return HttpResponse.json(
        { code: "INVALID_PHONE", message: "请输入有效的手机号" },
        { status: 400 }
      );
    }
    return HttpResponse.json({ success: true });
  }),

  http.post("/identity/v1/auth/sms/login", async ({ request }) => {
    await delay(600);
    const body = (await request.json()) as {
      phone: string;
      code: string;
    };

    if (body.phone === "13800000000" && body.code === "123456") {
      return HttpResponse.json(createLoginResponse("sms"));
    }

    return HttpResponse.json(
      {
        code: "INVALID_SMS",
        message: "手机号或验证码错误",
      },
      { status: 401 }
    );
  }),

  http.post("/identity/v1/auth/refresh", async () => {
    await delay(200);
    return HttpResponse.json({
      accessToken: generateToken(`refresh_${backendDemoUser.userId}`),
      refreshToken: generateToken(`refresh_token_${backendDemoUser.userId}`),
      accessExpiresIn: ACCESS_EXPIRES_IN_SECONDS,
      tokenType: "Bearer",
    });
  }),

  http.post("/identity/v1/auth/logout", async () => {
    await delay(200);
    return HttpResponse.json({ success: true });
  }),

  http.get("/identity/v1/users/me", async ({ request }) => {
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
      return HttpResponse.json({ user: backendDemoUser });
    }

    return HttpResponse.json(
      { code: "TOKEN_EXPIRED", message: "登录已过期" },
      { status: 401 }
    );
  }),

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
