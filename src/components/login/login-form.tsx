import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, Text, View } from "react-native";
import { FadeIn, FadeInDown, FadeInUp, FadeOut } from "react-native-reanimated";

import { GradientButton } from "@/components/login/gradient-button";
import {
  STAGGER,
  usePressScale,
  useShake,
} from "@/components/login/login-motion";
import { TextField } from "@/components/login/text-field";
import { useLiquidTransition } from "@/components/transition/liquid-transition";
import { Animated } from "@/components/ui/animated";
import { ThemedText } from "@/components/themed-text";
import { useAuth } from "@/contexts/auth-context";
import { getLoginErrorMessage } from "@/service/auth.service";

type LoginFormValues = {
  email: string;
  password: string;
};

/**
 * Credentials form. On success the session switches to authenticated and the
 * root navigator moves to the protected `(app)` routes.
 */
export function LoginForm() {
  const { signIn } = useAuth();
  const liquid = useLiquidTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Incrementado a cada tentativa inválida, para o formulário balançar de novo.
  const [failures, setFailures] = useState(0);
  const shakeStyle = useShake(failures);
  const buttonScale = usePressScale();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async ({ email, password }: LoginFormValues) => {
    setSubmitError(null);
    try {
      await signIn(email.trim(), password, { beforeEnter: liquid.cover });
    } catch (error) {
      setSubmitError(getLoginErrorMessage(error));
      setFailures((n) => n + 1);
    }
  };

  // O hero entra primeiro; o formulário começa logo depois.
  const enter = (step: number) =>
    FadeInUp.delay(STAGGER * (6 + step)).duration(450);

  return (
    <Animated.View className="gap-four" style={shakeStyle}>
      <Animated.View entering={enter(0)} className="gap-one">
        <ThemedText type="subtitle" className="text-2xl leading-[30px]">
          Entrar na sua conta
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Informe suas credenciais para acessar o painel.
        </ThemedText>
      </Animated.View>

      <Animated.View entering={enter(1)} className="gap-two">
        <Controller
          control={control}
          name="email"
          rules={{
            required: "E-mail é obrigatório",
            pattern: {
              value: /^\S+@\S+\.\S+$/,
              message: "Informe um e-mail válido",
            },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="E-mail ou usuário"
              icon="mail-outline"
              placeholder="seu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
            />
          )}
        />
        {errors.email && (
          <Animated.View entering={FadeInDown.duration(200)} exiting={FadeOut}>
            <Text style={{ color: "red" }}>{errors.email.message}</Text>
          </Animated.View>
        )}
      </Animated.View>

      <Animated.View entering={enter(2)} className="gap-two">
        <Controller
          control={control}
          name="password"
          rules={{
            required: "Senha é obrigatória",
            minLength: { value: 6, message: "Mínimo 6 caracteres" },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              label="Senha"
              icon="lock-closed-outline"
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              trailingIcon={showPassword ? "eye-off-outline" : "eye-outline"}
              onTrailingIconPress={() => setShowPassword((v) => !v)}
              trailingIconAccessibilityLabel={
                showPassword ? "Ocultar senha" : "Mostrar senha"
              }
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
            />
          )}
        />
        {errors.password && (
          <Animated.View entering={FadeInDown.duration(200)} exiting={FadeOut}>
            <Text style={{ color: "red" }}>{errors.password.message}</Text>
          </Animated.View>
        )}
      </Animated.View>

      <Animated.View
        entering={enter(3)}
        className="flex-row items-center justify-between"
      >
        <View className="flex-row items-center gap-two">
          <View className="h-[18px] w-[18px] items-center justify-center rounded-half bg-ink">
            <Ionicons name="checkmark" size={12} color="#ffffff" />
          </View>
          <ThemedText type="small">Lembrar de mim</ThemedText>
        </View>
        <ThemedText type="linkPrimary">Esqueceu a senha?</ThemedText>
      </Animated.View>

      {submitError && (
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(150)}
          className="flex-row items-center gap-two rounded-two bg-[#FEECEC] px-three py-two"
        >
          <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
          <ThemedText
            type="small"
            className="flex-1"
            style={{ color: "#B91C1C" }}
          >
            {submitError}
          </ThemedText>
        </Animated.View>
      )}

      <Animated.View entering={enter(4)}>
        <Animated.View style={buttonScale.style}>
          <GradientButton
            label={isSubmitting ? "Entrando..." : "Entrar"}
            icon="log-in-outline"
            disabled={isSubmitting}
            className={isSubmitting ? "opacity-70" : undefined}
            onPress={handleSubmit(onSubmit)}
            {...buttonScale.handlers}
          />
        </Animated.View>
      </Animated.View>

      <Animated.View
        entering={enter(5)}
        className="flex-row flex-wrap justify-center items-center"
      >
        <ThemedText type="small" themeColor="textSecondary">
          Ainda não tem uma conta?{" "}
        </ThemedText>
        <Pressable>
          <ThemedText type="linkPrimary">Criar conta</ThemedText>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}
