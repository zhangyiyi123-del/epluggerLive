package com.eplugger.security;

import com.eplugger.config.EpWorkSsoProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class EpWorkAppTokenVerifierTest {

    private static final String SECRET = "unit-test-epwork-sso-secret-32b!";

    private EpWorkAppTokenVerifier verifier;

    @BeforeEach
    void setUp() {
        EpWorkSsoProperties props = new EpWorkSsoProperties();
        props.setSecret(SECRET);
        verifier = new EpWorkAppTokenVerifier(props);
    }

    @Test
    void verify_acceptsValidToken() throws Exception {
        long exp = System.currentTimeMillis() + 60_000;
        String token = buildToken("n1", exp);
        Map<String, Object> payload = verifier.verify(token);
        assertEquals("u-test", payload.get("uid"));
        assertEquals("epWorkApp", payload.get("issuer"));
    }

    @Test
    void verify_rejectsExpiredToken() throws Exception {
        long exp = System.currentTimeMillis() - 1;
        String token = buildToken("n2", exp);
        assertThrows(IllegalArgumentException.class, () -> verifier.verify(token));
    }

    @Test
    void verify_rejectsTamperedSignature() throws Exception {
        long exp = System.currentTimeMillis() + 60_000;
        String token = buildToken("n3", exp);
        String tampered = token.substring(0, token.length() - 1) + "x";
        assertThrows(IllegalArgumentException.class, () -> verifier.verify(tampered));
    }

    private static String buildToken(String nonce, long expMs) throws Exception {
        String json = String.format(
                "{\"uid\":\"u-test\",\"systemCode\":\"default\",\"displayName\":\"Tester\","
                        + "\"role\":\"dev\",\"email\":\"\",\"mobile\":\"\",\"avatarUrl\":\"\","
                        + "\"ts\":%d,\"exp\":%d,\"nonce\":\"%s\",\"issuer\":\"epWorkApp\"}",
                System.currentTimeMillis(),
                expMs,
                nonce
        );
        byte[] payloadBytes = json.getBytes(StandardCharsets.UTF_8);
        String payloadB64 = Base64.getUrlEncoder().withoutPadding().encodeToString(payloadBytes);
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        String sig = Base64.getUrlEncoder().withoutPadding().encodeToString(mac.doFinal(payloadB64.getBytes(StandardCharsets.UTF_8)));
        return payloadB64 + "." + sig;
    }
}
