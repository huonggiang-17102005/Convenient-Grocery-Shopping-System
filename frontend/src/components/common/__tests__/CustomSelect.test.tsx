import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CustomSelect from '../CustomSelect';

const options = [
  { value: 'homemaker', label: 'Quản gia' },
  { value: 'member', label: 'Thành viên' },
  { value: 'admin', label: 'Quản trị viên' }
];

describe('CustomSelect Component Unit Tests', () => {
  const onChangeMock = vi.fn();

  beforeEach(() => {
    onChangeMock.mockClear();
  });

  it('Nên render đúng placeholder khi chưa chọn giá trị', () => {
    render(
      <CustomSelect
        value=""
        onChange={onChangeMock}
        options={options}
        placeholder="- Chọn vai trò -"
      />
    );

    // Kiểm tra xem placeholder có hiển thị trên màn hình không
    expect(screen.getByText('- Chọn vai trò -')).toBeInTheDocument();
  });

  it('Nên render đúng label của option khi đã chọn giá trị', () => {
    render(
      <CustomSelect
        value="homemaker"
        onChange={onChangeMock}
        options={options}
      />
    );

    // Kiểm tra xem nhãn của option được chọn có hiển thị không
    expect(screen.getByText('Quản gia')).toBeInTheDocument();
  });

  it('Nên mở dropdown khi người dùng click vào trigger', () => {
    render(
      <CustomSelect
        value=""
        onChange={onChangeMock}
        options={options}
      />
    );

    // Ban đầu danh sách option không được xuất hiện
    expect(screen.queryByText('Thành viên')).not.toBeInTheDocument();

    // Click vào nút trigger
    const triggerBtn = screen.getByRole('button');
    fireEvent.click(triggerBtn);

    // Sau khi click, danh sách options phải xuất hiện (Portal render ra body)
    expect(screen.getByText('Thành viên')).toBeInTheDocument();
    expect(screen.getByText('Quản trị viên')).toBeInTheDocument();
  });

  it('Nên gọi onChange với giá trị đúng và đóng dropdown khi click chọn option', () => {
    render(
      <CustomSelect
        value=""
        onChange={onChangeMock}
        options={options}
      />
    );

    // Mở dropdown
    fireEvent.click(screen.getByRole('button'));

    // Click vào option 'Thành viên'
    const memberOption = screen.getByText('Thành viên');
    fireEvent.click(memberOption);

    // Kiểm tra callback được gọi
    expect(onChangeMock).toHaveBeenCalledWith('member');

    // Sau khi chọn, dropdown phải tự động đóng
    expect(screen.queryByText('Thành viên')).not.toBeInTheDocument();
  });

  it('Không nên mở dropdown và không thể tương tác khi bị disabled', () => {
    render(
      <CustomSelect
        value=""
        onChange={onChangeMock}
        options={options}
        disabled={true}
      />
    );

    const triggerBtn = screen.getByRole('button');
    // Button phải có thuộc tính disabled thực tế
    expect(triggerBtn).toBeDisabled();

    // Thử click vào button
    fireEvent.click(triggerBtn);

    // Dropdown không được mở ra
    expect(screen.queryByText('Quản gia')).not.toBeInTheDocument();
    expect(onChangeMock).not.toHaveBeenCalled();
  });
});
