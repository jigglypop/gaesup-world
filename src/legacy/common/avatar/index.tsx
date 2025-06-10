import LazyLoad from "react-lazyload";
import { avatarRecipe } from "./recipe.css";
import * as S from "./styles.css";
import { avatarType } from "./type";

// 프로필 이미지 아바타
export default function Avatar({ imageUrl, type, roleNumber }: avatarType) {
  return (
    <div className={`${avatarRecipe({ type })}`}>
      <div className={`${S.avatarBorder} ${avatarRecipe({ type })}`}>
        <LazyLoad height={10}>
          <img
            alt={`${imageUrl} 아바타 이미지`}
            className={`${S.avatarImageResipe({
              color: roleNumber !== undefined ? roleNumber : 0,
            })} ${avatarRecipe({ type })}`}
            src={`${
              imageUrl === null || imageUrl === ""
                ? "/aggjack/image/avatar/ally_avatar.webp"
                : imageUrl
            }`}
          />
        </LazyLoad>
      </div>
    </div>
  );
}
