import React, { useState, useEffect } from "react";
import api from "../api/axios";

const DEFAULT_PROFILE = process.env.PUBLIC_URL + "/profile-default.png";

/**
 * DB에 저장된 프로필 사진을 JWT로 fetch하여 표시 (img src는 헤더 전송 불가 → blob URL 사용)
 * mb_photo_ver 변경 시 자동 리패치
 */
function ProfileImage({ user, className, alt = "프로필" }) {
  const [src, setSrc] = useState(DEFAULT_PROFILE);
  const photoVer = user?.mb_photo_ver ?? user?.mbPhotoVer;

  useEffect(() => {
    if (!user || photoVer == null) {
      setSrc(DEFAULT_PROFILE);
      return;
    }
    let cancelled = false;
    api
      .get("/auth/profile-photo", { responseType: "blob" })
      .then((res) => {
        if (cancelled) return;
        const blob = res.data;
        if (blob && blob.size > 0) {
          setSrc(URL.createObjectURL(blob));
        } else {
          setSrc(DEFAULT_PROFILE);
        }
      })
      .catch(() => {
        if (!cancelled) setSrc(DEFAULT_PROFILE);
      });
    return () => {
      cancelled = true;
      setSrc((prev) => {
        if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
        return DEFAULT_PROFILE;
      });
    };
  }, [user, photoVer]);

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={(e) => {
        e.target.src = DEFAULT_PROFILE;
      }}
    />
  );
}

export default ProfileImage;
