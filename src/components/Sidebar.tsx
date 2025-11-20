import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Box,
  Divider,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";

export const DRAWER_WIDTH = 260;

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export const Sidebar = ({ open, onClose }: SidebarProps) => {
  const menuItems = [
    {
      text: "Contacts",
      icon: <PeopleIcon />,
      path: "/",
    },
  ];

  const drawerContent = (
    <Box>
      <Toolbar>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            py: 1,
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mr: 2,
            }}
          >
            <Box
              component="span"
              sx={{
                color: "white",
                fontWeight: 700,
                fontSize: "1.25rem",
              }}
            >
              30X
            </Box>
          </Box>
          <Box>
            <Box sx={{ fontWeight: 700, fontSize: "1.1rem", lineHeight: 1.2 }}>
              Investor Match
            </Box>
            <Box sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
              Management Portal
            </Box>
          </Box>
        </Box>
      </Toolbar>
      <Divider />
      <List sx={{ px: 1, pt: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              selected
              sx={{
                borderRadius: 2,
                "&.Mui-selected": {
                  backgroundColor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                  "& .MuiListItemIcon-root": {
                    color: "primary.contrastText",
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: 600,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box component="nav" sx={{ flexShrink: { md: 0 } }}>
      {/* Single temporary drawer (overlay) for all breakpoints */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: DRAWER_WIDTH,
            borderRight: "1px solid",
            borderColor: "divider",
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};
