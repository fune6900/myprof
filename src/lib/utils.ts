import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * クラス名を束ねる。後から渡した Tailwind のクラスが勝つ。
 *
 * shadcn 系のコンポーネントが前提にしているユーティリティ。
 * このリポジトリは shadcn を使っていないが、外から取り込んだものが
 * これを import するので同じ形で用意しておく。
 */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
