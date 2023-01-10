export class CreateCategoryDto {
  name: string;
  subcategories: CreateCategoryDto[] | null;
}
