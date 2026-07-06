import * as React from 'react';
import { Navigate, Route } from 'react-router-dom';
import { ErrorBoundary } from '@/components/error-boundary';
import { PageLoader } from '@/components/page-loader';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import {
  BarChart3Icon, BookOpenIcon, Building2Icon, ChevronRightIcon,
  ClipboardListIcon, ExternalLinkIcon, FileTextIcon, FileSpreadsheetIcon,
  HandshakeIcon, LayoutDashboardIcon, ReceiptIcon, Settings2Icon,
  ShoppingCartIcon, UserCogIcon, UsersIcon, WalletIcon,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';

const OverviewPage = React.lazy(() => import('@/pages/overview-page'));
const ProfilePage = React.lazy(() => import('@/pages/profile-page'));
const ProductsPage = React.lazy(() => import('@/pages/products-page'));
const ProductCategoriesPage = React.lazy(() => import('@/pages/product-categories-page'));
const ProductMaterialsPage = React.lazy(() => import('@/pages/product-materials-page'));
const ProductDetailPage = React.lazy(() => import('@/pages/product-detail-page'));
const ProductCategoryDetailPage = React.lazy(() => import('@/pages/product-category-detail-page'));
const ProductMaterialDetailPage = React.lazy(() => import('@/pages/product-material-detail-page'));
const OrdersPage = React.lazy(() => import('@/pages/orders-page'));
const OrdersPendingPage = React.lazy(() => import('@/pages/orders-pending-page'));
const OrderDetailPage = React.lazy(() => import('@/pages/order-detail-page'));
const CustomersAdminPage = React.lazy(() => import('@/pages/customers-admin-page'));
const CustomerDetailPage = React.lazy(() => import('@/pages/customer-detail-page'));
const InternalUsersPage = React.lazy(() => import('@/pages/internal-users-page'));
const InternalUserDetailPage = React.lazy(() => import('@/pages/internal-user-detail-page'));
const InventoryPage = React.lazy(() => import('@/pages/inventory-page'));
const InventoryDetailPage = React.lazy(() => import('@/pages/inventory-detail-page'));
const StaticPagesPage = React.lazy(() => import('@/pages/static-pages-page'));
const StaticPageDetailPage = React.lazy(() => import('@/pages/static-page-detail-page'));
const ArticlesAdminPage = React.lazy(() => import('@/pages/articles-admin-page'));
const ArticleDetailPage = React.lazy(() => import('@/pages/article-detail-page'));
const CustomerFeedbacksAdminPage = React.lazy(() => import('@/pages/customer-feedbacks-admin-page'));
const CustomerFeedbackDetailPage = React.lazy(() => import('@/pages/customer-feedback-detail-page'));
const ContactInquiriesPage = React.lazy(() => import('@/pages/contact-inquiries-page'));
const ContactInquiryDetailPage = React.lazy(() => import('@/pages/contact-inquiry-detail-page'));
const CampaignsAdminPage = React.lazy(() => import('@/pages/campaigns-admin-page'));
const CampaignDetailPage = React.lazy(() => import('@/pages/campaign-detail-page'));
const PromotionDiscountsPage = React.lazy(() => import('@/pages/promotion-discounts-page'));
const PromotionDiscountDetailPage = React.lazy(() => import('@/pages/promotion-discount-detail-page'));
const ImageSizesPage = React.lazy(() => import('@/pages/image-sizes-page'));
const GlobalConfigPage = React.lazy(() => import('@/pages/global-config-page'));
const AuditLogsPage = React.lazy(() => import('@/pages/audit-logs-page'));

function lazyRoute(node: React.ReactNode) {
  return (
    <ErrorBoundary>
      <React.Suspense fallback={<PageLoader />}>{node}</React.Suspense>
    </ErrorBoundary>
  );
}

export type AdminNavItem = {
  title: string; path: string; icon: React.ComponentType<{ className?: string }>;
  iconClassName?: string; children?: { title: string; path: string }[];
};

export type AdminNavSection = { id: string; label: string; items: AdminNavItem[] };

export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  { id: 'overview', label: 'Tổng quan', items: [
    { title: 'Dashboard', path: '/', icon: LayoutDashboardIcon, iconClassName: 'text-blue-600 dark:text-blue-400' },
  ]},
  { id: 'finance', label: 'Tài chính - Kế toán', items: [
    { title: 'Doanh thu', path: '/revenue', icon: BarChart3Icon, iconClassName: 'text-emerald-600 dark:text-emerald-400' },
    { title: 'Hóa đơn', path: '/orders', icon: ReceiptIcon, iconClassName: 'text-orange-600 dark:text-orange-400' },
    { title: 'Công nợ', path: '/debt', icon: WalletIcon, iconClassName: 'text-red-600 dark:text-red-400' },
    { title: 'Đối soát', path: '/reconciliation', icon: ClipboardListIcon, iconClassName: 'text-cyan-600 dark:text-cyan-400' },
  ]},
  { id: 'commerce', label: 'Thương mại', items: [
    { title: 'Sản phẩm', path: '/products', icon: ShoppingCartIcon, iconClassName: 'text-violet-600 dark:text-violet-400' },
    { title: 'Đơn hàng', path: '/orders', icon: FileSpreadsheetIcon, iconClassName: 'text-sky-600 dark:text-sky-400', children: [{ title: 'Tất cả đơn', path: '/orders' }, { title: 'Chờ xử lý', path: '/orders/pending' }] },
    { title: 'Khách hàng', path: '/customers', icon: HandshakeIcon, iconClassName: 'text-rose-600 dark:text-rose-400' },
    { title: 'Kho hàng', path: '/inventory', icon: Building2Icon, iconClassName: 'text-amber-600 dark:text-amber-400' },
  ]},
  { id: 'content', label: 'Nội dung', items: [
    { title: 'Trang & bài viết', path: '/content', icon: BookOpenIcon, iconClassName: 'text-indigo-600 dark:text-indigo-400', children: [{ title: 'Trang tĩnh', path: '/content/pages' }, { title: 'Bài viết', path: '/content/articles' }] },
  ]},
  { id: 'system', label: 'Hệ thống', items: [
    { title: 'Nhân viên', path: '/internal-users', icon: UserCogIcon, iconClassName: 'text-teal-600 dark:text-teal-400' },
    { title: 'Nhật ký', path: '/audit-logs', icon: FileTextIcon, iconClassName: 'text-zinc-600 dark:text-zinc-400' },
    { title: 'Cài đặt', path: '/settings', icon: Settings2Icon, iconClassName: 'text-slate-600 dark:text-slate-400', children: [{ title: 'Website & SEO', path: '/settings/website' }, { title: 'Kích thước ảnh', path: '/settings/image-sizes' }] },
  ]},
];

export const ADMIN_QUICK_LINKS = [{ name: 'Cổng thông tin e-conomic', url: 'https://www.e-conomic.com/', icon: <ExternalLinkIcon className='text-blue-600 dark:text-blue-400' aria-hidden /> }];

export type BreadcrumbEntry = { label: string; href?: string };
export function getAdminBreadcrumbs(pathname: string): BreadcrumbEntry[] {
  const path = pathname === '' ? '/' : pathname;
  if (path === '/') return [{ label: 'Dashboard' }];
  const root: BreadcrumbEntry = { label: 'Dashboard', href: '/' };
  const orderDetail = path.match(/^\/orders\/([^/]+)$/);
  if (orderDetail && orderDetail[1] !== 'pending') return [root, { label: 'Đơn hàng', href: '/orders' }, { label: 'Chi tiết đơn' }];
  const invDetail = path.match(/^\/inventory\/([^/]+)$/);
  if (invDetail) return [root, { label: 'Kho hàng', href: '/inventory' }, { label: 'Quản lý kho' }];
  const prodDetail = path.match(/^\/products\/([^/]+)$/);
  if (prodDetail && prodDetail[1] !== 'categories') return [root, { label: 'Sản phẩm', href: '/products' }, { label: 'Chi tiết sản phẩm' }];
  const catDetail = path.match(/^\/products\/categories\/([^/]+)$/);
  if (catDetail) return [root, { label: 'Sản phẩm', href: '/products' }, { label: 'Danh mục', href: '/products/categories' }, { label: 'Chi tiết danh mục' }];
  for (const section of ADMIN_NAV_SECTIONS) {
    for (const item of section.items) {
      if (item.children?.length) {
        const child = item.children.find(c => c.path === path);
        if (child) return item.path === child.path ? [root, { label: child.title }] : [root, { label: item.title, href: item.path }, { label: child.title }];
      }
      if (item.path === path) return [root, { label: item.title }];
    }
  }
  return [root, { label: 'Trang' }];
}

export function AdminSidebarNav() {
  const { pathname } = useLocation();
  function itemGroupActive(item: AdminNavItem, p: string) {
    return item.children?.some(c => p === c.path || p.startsWith(`${c.path}/`)) || p === item.path || p.startsWith(`${item.path}/`);
  }
  return (
    <>
      {ADMIN_NAV_SECTIONS.map(section => (
        <SidebarGroup key={section.id}>
          <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
          <SidebarMenu>
            {section.items.map(item => (
              item.children?.length ? (
                <Collapsible key={`${section.id}-${item.path}`} asChild defaultOpen={itemGroupActive(item, pathname)} className='group/collapsible'>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title}>
                        <item.icon className={item.iconClassName} />
                        <span>{item.title}</span>
                        <ChevronRightIcon className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' aria-hidden />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.children.map(sub => (
                          <SidebarMenuSubItem key={sub.path}>
                            <SidebarMenuSubButton asChild isActive={sub.path === pathname}>
                              <NavLink to={sub.path}><span>{sub.title}</span></NavLink>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild tooltip={item.title} isActive={item.path === pathname || (item.path !== '/' && pathname.startsWith(`${item.path}/`))}>
                    <NavLink to={item.path} end={item.path === '/'}>
                      <item.icon className={item.iconClassName} />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  );
}

export function AdminQuickLinksNav() {
  return (
    <SidebarGroup className='group-data-[collapsible=icon]:hidden'>
      <SidebarGroupLabel>Liên kết nhanh</SidebarGroupLabel>
      <SidebarMenu>
        {ADMIN_QUICK_LINKS.map(link => (
          <SidebarMenuItem key={link.name}>
            <SidebarMenuButton asChild>
              <a href={link.url} target='_blank' rel='noopener noreferrer'>
                {link.icon}
                <span>{link.name}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}

export const adminNestedRouteElements = (
  <>
    <Route index element={lazyRoute(<OverviewPage />)} />
    <Route path='profile' element={lazyRoute(<ProfilePage />)} />
    <Route path='products' element={lazyRoute(<ProductsPage />)} />
    <Route path='products/categories' element={lazyRoute(<ProductCategoriesPage />)} />
    <Route path='products/categories/:categoryId' element={lazyRoute(<ProductCategoryDetailPage />)} />
    <Route path='products/decorative-stones' element={lazyRoute(<ProductMaterialsPage />)} />
    <Route path='products/decorative-stones/:materialId' element={lazyRoute(<ProductMaterialDetailPage />)} />
    <Route path='products/:productId' element={lazyRoute(<ProductDetailPage />)} />
    <Route path='orders' element={lazyRoute(<OrdersPage />)} />
    <Route path='orders/pending' element={lazyRoute(<OrdersPendingPage />)} />
    <Route path='orders/:orderId' element={lazyRoute(<OrderDetailPage />)} />
    <Route path='customers' element={lazyRoute(<CustomersAdminPage />)} />
    <Route path='customers/:customerId' element={lazyRoute(<CustomerDetailPage />)} />
    <Route path='internal-users' element={lazyRoute(<InternalUsersPage />)} />
    <Route path='internal-users/:userId' element={lazyRoute(<InternalUserDetailPage />)} />
    <Route path='inventory' element={lazyRoute(<InventoryPage />)} />
    <Route path='inventory/:productId' element={lazyRoute(<InventoryDetailPage />)} />
    <Route path='content/pages' element={lazyRoute(<StaticPagesPage />)} />
    <Route path='content/pages/:pageId' element={lazyRoute(<StaticPageDetailPage />)} />
    <Route path='content/articles' element={lazyRoute(<ArticlesAdminPage />)} />
    <Route path='content/articles/:articleId' element={lazyRoute(<ArticleDetailPage />)} />
    <Route path='content/customer-feedbacks' element={lazyRoute(<CustomerFeedbacksAdminPage />)} />
    <Route path='content/customer-feedbacks/:feedbackId' element={lazyRoute(<CustomerFeedbackDetailPage />)} />
    <Route path='content/contact-inquiries' element={lazyRoute(<ContactInquiriesPage />)} />
    <Route path='content/contact-inquiries/:inquiryId' element={lazyRoute(<ContactInquiryDetailPage />)} />
    <Route path='content' element={<Navigate to='/content/pages' replace />} />
    <Route path='campaigns' element={lazyRoute(<CampaignsAdminPage />)} />
    <Route path='campaigns/:campaignId' element={lazyRoute(<CampaignDetailPage />)} />
    <Route path='promotions' element={lazyRoute(<PromotionDiscountsPage />)} />
    <Route path='promotions/:promotionId' element={lazyRoute(<PromotionDiscountDetailPage />)} />
    <Route path='settings/image-sizes' element={lazyRoute(<ImageSizesPage />)} />
    <Route path='settings/website' element={lazyRoute(<GlobalConfigPage />)} />
    <Route path='settings' element={<Navigate to='/settings/image-sizes' replace />} />
    <Route path='audit-logs' element={lazyRoute(<AuditLogsPage />)} />
    <Route path='*' element={<Navigate to='/' replace />} />
  </>
);
